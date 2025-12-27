<script setup>
import { ref, onMounted } from "vue";
import api from "@/helpers/api";
import { useRoute } from "vue-router";
import { jsPDF } from "jspdf";

const booking = ref({});
const route = useRoute();
const showCancelModal = ref(false);
const selectedBooking = ref(null);
const isCancelling = ref(false);
const showEditModal = ref(false);
const editingPassenger = ref(null);
const editForm = ref({
    FirstName: "",
    LastName: "",
    PassportNumber: "",
    DateOfBirth: "",
});

// Grab the PNR from the URL query: /success?pnr=ABCD12
const pnr = route.params.pnr || "XXXXXX";
console.log(pnr);

const fetctBooking = async () => {
    try {
        // Backend should filter by the logged-in user's ID
        const res = await api.get(`bookings/${pnr}`);
        booking.value = res.data;
    } catch (err) {
        console.error("Failed to fetch bookings", err);
    }
};

const downloadTicket = (booking, passenger) => {
    const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
    });

    // --- Styles & Branding ---
    doc.setFillColor(30, 58, 138); // Dark Blue (Matches your UI)
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("BOARDING PASS", 105, 25, { align: "center" });

    // --- Ticket Body ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PASSENGER NAME", 20, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`${passenger.FirstName} ${passenger.LastName}`, 20, 68);

    doc.setFont("helvetica", "bold");
    doc.text("PNR / REFERENCE", 140, 60);
    doc.setFont("helvetica", "normal");
    doc.text(booking.PNR, 140, 68);

    // --- Flight Details ---
    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75); // Divider

    doc.setFont("helvetica", "bold");
    doc.text("FLIGHT", 20, 85);
    doc.text("FROM", 70, 85);
    doc.text("TO", 120, 85);
    doc.text("SEAT", 170, 85);

    doc.setFont("helvetica", "normal");
    doc.text(booking.flight?.FlightNumber || "N/A", 20, 93);
    doc.text(
        `${booking.flight?.departure_airport?.City} - ${booking.flight?.departure_airport?.IATACode}` ||
            "DEP",
        70,
        93,
    );
    doc.text(
        `${booking.flight?.arrival_airport?.City} - ${booking.flight?.arrival_airport?.IATACode}` ||
            "ARR",
        120,
        93,
    );

    // The Star of the Show: The Auto-Assigned Seat
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138);
    doc.text(passenger.SeatNumber, 170, 93);

    // --- Footer / Instructions ---
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(
        "Please present this ticket and a valid ID at the boarding gate.",
        105,
        120,
        { align: "center" },
    );

    // Save the file
    doc.save(`Ticket_${booking.PNR}_${passenger.LastName}.pdf`);
};

// cancel flight / booking
const confirmCancel = (booking) => {
    selectedBooking.value = booking;
    showCancelModal.value = true;
};

// Execute the API call
const executeCancellation = async () => {
    if (!selectedBooking.value) return;
    if (isCancelling.value) return;

    isCancelling.value = true;
    try {
        const pnr = selectedBooking.value.PNR;
        await api.put(`/bookings/${pnr}/cancel`);

        // Update local state to show "Cancelled" without a page refresh
        selectedBooking.value.BookingStatus = "Cancelled";

        // Close modal
        showCancelModal.value = false;
        selectedBooking.value = null;

        alert("Booking successfully cancelled.");
    } catch (err) {
        alert(err.response?.data?.detail || "Cancellation failed.");
    } finally {
        isCancelling.value = false;
    }
};

// Open modal and pre-fill data
const openEditPassenger = (passenger) => {
    editingPassenger.value = passenger;
    editForm.value = { ...passenger }; // Create a copy so we don't edit the UI live
    showEditModal.value = true;
};

const savePassengerChanges = async () => {
    try {
        const id = editingPassenger.value.PassengerID;
        // Your Backend PUT route: /passengers/{id}
        await api.put(`/passengers/${id}`, editForm.value);

        // Update the local UI state
        editingPassenger.value.FirstName = editForm.value.FirstName;
        editingPassenger.value.LastName = editForm.value.LastName;
        editingPassenger.value.PassportNumber = editForm.value.PassportNumber;
        editingPassenger.value.DateOfBirth = editForm.value.DateOfBirth;

        showEditModal.value = false;
        alert("Passenger details updated!");
    } catch (err) {
        alert("Failed to update passenger.");
    }
};
onMounted(fetctBooking);
</script>

<template>
    <div class="max-w-4xl mx-auto p-6">
        <div v-if="booking" class="space-y-6">
            <div
                :key="booking.BookingID"
                class="bg-white rounded-3xl shadow-sm border overflow-hidden"
            >
                <div
                    class="bg-blue-700 p-4 text-white flex justify-between items-center"
                >
                    <div>
                        <p class="text-xs opacity-75 uppercase tracking-widest">
                            Booking Reference
                        </p>
                        <h2 class="text-xl font-mono font-bold">
                            {{ booking.PNR }}
                        </h2>
                    </div>
                    <div class="text-right">
                        <p class="text-xs opacity-75 uppercase tracking-widest">
                            Flight
                        </p>
                        <h2 class="text-xl font-bold">
                            {{ booking.flight?.FlightNumber || "N/A" }}
                        </h2>
                    </div>
                </div>

                <div class="p-6 space-y-4">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-gray-700">{{
                            `${booking.flight?.departure_airport?.City} ${booking.flight?.departure_airport?.IATACode}`
                        }}</span>

                        <div
                            class="w-full border-t-2 border-dashed border-gray-300 relative"
                        >
                            <span
                                class="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-blue-500"
                                >✈</span
                            >
                        </div>

                        <span class="text-gray-400">➔</span>
                        <span class="font-bold text-gray-700">{{
                            `${booking.flight?.arrival_airport?.City} ${booking.flight?.arrival_airport?.IATACode}`
                        }}</span>
                    </div>
                    <div
                        v-for="p in booking.passengers"
                        :key="p.PassengerID"
                        class="flex items-center border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50 relative"
                    >
                        <div class="flex-grow">
                            <span
                                class="text-xs text-gray-400 font-bold uppercase"
                            >
                                Passenger
                            </span>
                            <button
                                @click="openEditPassenger(p)"
                                class="p-1.5 rounded-full hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-all duration-200 focus:opacity-100"
                                title="Edit Passenger Details"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                </svg>
                            </button>
                            <h3 class="text-lg font-bold text-blue-900">
                                {{ p.FirstName }} {{ p.LastName }}
                            </h3>
                            <p class="text-xs text-gray-500 mt-1">
                                Passport: {{ p.PassportNumber }}
                            </p>
                        </div>

                        <div
                            class="h-12 border-l-2 border-dashed border-gray-300 mx-4"
                        ></div>

                        <div class="text-center px-4">
                            <p
                                class="text-xs text-gray-400 font-bold uppercase"
                            >
                                Seat
                            </p>
                            <div
                                class="text-2xl font-black text-blue-600 font-mono"
                            >
                                {{ p.SeatNumber }}
                            </div>
                        </div>

                        <button
                            @click="downloadTicket(booking, p)"
                            type="button"
                            class="ml-4 p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition"
                        >
                            <span class="text-xl">⬇️</span>
                        </button>
                    </div>

                    <p
                        class="text-green-800 bg-green-100 rounded-full transition py-2 px-3 max-w-fit"
                        v-if="booking.BookingStatus !== 'Cancelled'"
                    >
                        {{ booking.BookingStatus }}
                    </p>

                    <p
                        v-else
                        class="text-red-800 bg-red-100 rounded-full transition py-2 px-3 max-w-fit"
                    >
                        {{ booking.BookingStatus }}
                    </p>
                </div>

                <div
                    class="bg-gray-50 px-6 py-3 border-t flex justify-between items-center text-sm"
                >
                    <button
                        @click="openEditModal(booking)"
                        class="text-sm font-bold text-blue-600 hover:underline"
                    >
                        Edit Passenger Details
                    </button>

                    <button
                        @click="confirmCancel(booking)"
                        v-if="booking.BookingStatus !== 'Cancelled'"
                        class="text-sm font-bold text-red-500 hover:underline cursor-pointer"
                    >
                        Cancel Entire Booking
                    </button>

                    <span
                        v-else
                        class="text-sm font-bold text-gray-600 italic bg-gray-200 px-2 py-2 rounded-full"
                    >
                        Cancelled
                    </span>
                </div>
            </div>
        </div>

        <div
            v-else
            class="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed"
        >
            <p class="text-gray-500">No bookings found.</p>
            <router-link
                to="/"
                class="text-blue-600 font-bold mt-2 inline-block underline"
                >Book a flight</router-link
            >
        </div>
    </div>

    <!-- cancellation modal -->
    <div
        v-if="showCancelModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 bg-opacity-50 backdrop-blur-sm"
    >
        <div
            class="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
        >
            <div class="bg-red-50 p-6 text-center">
                <div
                    class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <span class="text-3xl">⚠️</span>
                </div>
                <h3 class="text-xl font-bold text-red-900">Cancel Booking?</h3>
                <p class="text-sm text-red-700 mt-1">
                    This action cannot be undone.
                </p>
            </div>

            <div class="p-6">
                <div class="bg-gray-50 rounded-2xl p-4 mb-6">
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-500 text-sm">Reference:</span>
                        <span class="font-mono font-bold">{{
                            selectedBooking?.PNR
                        }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500 text-sm"
                            >Seats to Release:</span
                        >
                        <span class="font-bold">{{
                            selectedBooking?.passengers?.length
                        }}</span>
                    </div>
                </div>

                <p class="text-sm text-gray-600 mb-6 text-center">
                    By clicking confirm, your seats will be released back into
                    the inventory for other passengers to book.
                </p>

                <div class="flex gap-3">
                    <button
                        @click="showCancelModal = false"
                        class="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                    >
                        Nevermind
                    </button>
                    <button
                        @click="executeCancellation"
                        class="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-200"
                    >
                        Confirm Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- edit modal -->
    <div
        v-if="showEditModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md"
    >
        <div
            class="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-white/20"
        >
            <div
                class="p-6 border-b border-gray-100 flex justify-between items-center"
            >
                <h3 class="text-xl font-bold text-slate-800">Edit Passenger</h3>
                <button
                    @click="showEditModal = false"
                    class="text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>
            </div>

            <form @submit.prevent="savePassengerChanges" class="p-6 space-y-4">
                <div>
                    <label
                        class="block text-xs font-bold text-gray-400 uppercase mb-1"
                        >First Name</label
                    >
                    <input
                        v-model="editForm.FirstName"
                        type="text"
                        class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label
                        class="block text-xs font-bold text-gray-400 uppercase mb-1"
                        >Last Name</label
                    >
                    <input
                        v-model="editForm.LastName"
                        type="text"
                        class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label
                        class="block text-xs font-bold text-gray-400 uppercase mb-1"
                        >Passport Number</label
                    >
                    <input
                        v-model="editForm.PassportNumber"
                        type="text"
                        class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label
                        class="block text-xs font-bold text-gray-400 uppercase mb-1"
                        >Passport Number</label
                    >
                    <input
                        v-model="editForm.DateOfBirth"
                        type="date"
                        class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div class="pt-4 flex gap-3">
                    <button
                        type="button"
                        @click="showEditModal = false"
                        class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
