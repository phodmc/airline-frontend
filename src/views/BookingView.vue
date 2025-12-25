<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../helpers/api";

const route = useRoute();
const router = useRouter();
const flight = ref(null);
const isSubmitting = ref(false);

const passengers = ref([
    {
        FirstName: "",
        LastName: "",
        DateOfBirth: "",
        PassportNumber: "",
        InventoryID: null, // This will be the ID of the class they pick (Eco/Bus)
        SeatNumber: "AUTO", // Or leave null if your DB allows
    },
]);

const addPassenger = () => {
    passengers.value.push({
        FirstName: "",
        LastName: "",
        DateOfBirth: "",
        PassportNumber: "",
        InventoryID: null,
        SeatNumber: "",
    });
};

const removePassenger = (index) => {
    if (passengers.value.length > 1) {
        passengers.value.splice(index, 1);
    }
};

const submitBooking = async (inventoryId) => {
    // 1. Validate that names aren't empty
    const isValid = passengers.value.every((p) => p.FirstName && p.LastName);
    if (!isValid) {
        alert("Please fill in all passenger names.");
        return;
    }

    // 2. Map the chosen class ID to everyone in the group
    const finalPassengers = passengers.value.map((p) => ({
        ...p,
        InventoryID: inventoryId,
        SeatNumber: p.SeatNumber || "TBD", // Default if empty
    }));

    isSubmitting.value = true;
    try {
        const payload = { passengers: finalPassengers };
        const res = await api.post("/bookings", payload);

        // Success! Show PNR and redirect
        alert(`Booking Confirmed! PNR: ${res.data.PNR}`);
        router.push("/success");
    } catch (err) {
        console.error(err);
        alert(err.response?.data?.detail || "Check your seat availability.");
    } finally {
        isSubmitting.value = false;
    }
};

const calculateTotal = (baseFare) => {
    return (baseFare * passengers.value.length).toLocaleString();
};

onMounted(async () => {
    // Fetch the specific flight details using the ID from the URL
    const res = await api.get(`/flights/${route.params.id}`);
    flight.value = res.data;
});
</script>
<template>
    <div v-if="flight" class="max-w-4xl mx-auto p-8">
        <h1 class="text-3xl font-bold mb-6">Confirm Your Flight</h1>

        <div class="bg-blue-900 text-white p-6 rounded-xl">
            <p class="text-sm uppercase opacity-75">
                Flight #{{ flight.FlightNumber }}
            </p>
            <div class="flex justify-between items-center text-2xl font-bold">
                <span
                    >{{ flight.departure_airport.Name }}-{{
                        flight.departure_airport.IATACode
                    }}</span
                >
                <span>➔</span>
                <span
                    >{{ flight.arrival_airport.Name }}-{{
                        flight.arrival_airport.IATACode
                    }}</span
                >
            </div>
        </div>

        <div class="space-y-8 mt-7">
            <div
                v-for="(passenger, index) in passengers"
                :key="index"
                class="p-6 border rounded-xl bg-gray-50 relative"
            >
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-blue-800 tracking-tight">
                        Passenger {{ index + 1 }}
                    </h3>
                    <button
                        v-if="passengers.length > 1"
                        @click="removePassenger(index)"
                        class="text-red-500 text-sm hover:underline"
                    >
                        Remove
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="flex flex-col">
                        <label
                            class="text-xs font-bold text-gray-400 uppercase mb-1"
                            >First Name</label
                        >
                        <input
                            v-model="passenger.FirstName"
                            class="border p-2 rounded-lg"
                            placeholder="John"
                        />
                    </div>
                    <div class="flex flex-col">
                        <label
                            class="text-xs font-bold text-gray-400 uppercase mb-1"
                            >Last Name</label
                        >
                        <input
                            v-model="passenger.LastName"
                            class="border p-2 rounded-lg"
                            placeholder="Doe"
                        />
                    </div>
                    <div class="flex flex-col">
                        <label
                            class="text-xs font-bold text-gray-400 uppercase mb-1"
                            >Passport Number</label
                        >
                        <input
                            v-model="passenger.PassportNumber"
                            class="border p-2 rounded-lg"
                            placeholder="A1234567"
                        />
                    </div>
                    <div class="flex flex-col">
                        <label
                            class="text-xs font-bold text-gray-400 uppercase mb-1"
                            >Date of Birth</label
                        >
                        <input
                            v-model="passenger.DateOfBirth"
                            type="date"
                            class="border p-2 rounded-lg"
                        />
                    </div>
                </div>
            </div>

            <button
                @click="addPassenger"
                class="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition"
            >
                + Add Another Passenger
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div
                v-for="item in flight.inventory_items"
                :key="item.ClassCode"
                class="border-2 p-6 rounded-xl hover:border-blue-500 transition cursor-pointer bg-white"
                @click="submitBooking(item.InventoryID)"
            >
                <h3 class="text-xl font-bold">
                    {{ item.ClassCode == "Y" ? "Economy" : "Business" }}
                </h3>
                <p class="text-3xl font-black text-blue-600 mt-2">
                    ${{ item.BaseFare }}
                    <span class="text-sm font-normal text-gray-400"
                        >/ per person</span
                    >
                </p>

                <div
                    v-if="passengers.length > 1"
                    class="mt-2 p-2 bg-blue-50 rounded text-blue-800 font-bold"
                >
                    {{ passengers.length }} travelers: ${{
                        calculateTotal(item.BaseFare)
                    }}
                </div>

                <button
                    :disabled="
                        isSubmitting ||
                        item.TotalSeats - item.SeatsBooked < passengers.length
                    "
                    class="w-full mt-4 bg-gray-800 text-white py-2 rounded-lg cursor-pointer font-bold disabled:bg-gray-400"
                >
                    {{ isSubmitting ? "Processing..." : "Confirm Booking" }}
                </button>
            </div>
        </div>
    </div>
</template>
<!-- <template>
    <div
        v-if="flight"
        class="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10"
    >
        <h2 class="text-2xl font-bold text-blue-900 mb-4">Finalize Booking</h2>

        <div class="bg-blue-50 p-4 rounded-lg mb-6 flex justify-between">
            <div>
                <p class="font-bold text-lg">{{ flight.FlightNumber }}</p>
                <p>
                    {{ flight.departure_airport.IATACode }} ➔
                    {{ flight.arrival_airport.IATACode }}
                </p>
            </div>
            <div class="text-right text-sm text-gray-600">
                {{ new Date(flight.DepartureDateTime).toLocaleDateString() }}
            </div>
        </div>

        <div class="space-y-4 mb-8">
            <h3 class="font-bold border-b pb-2">Passenger Information</h3>
            <div class="grid grid-cols-2 gap-4">
                <input
                    v-model="passengers[0].FirstName"
                    placeholder="First Name"
                    class="border p-2 rounded"
                />
                <input
                    v-model="passengers[0].LastName"
                    placeholder="Last Name"
                    class="border p-2 rounded"
                />
            </div>
            <input
                v-model="passengers[0].PassportNumber"
                placeholder="Passport Number"
                class="border p-2 rounded w-full"
            />
            <input
                v-model="passengers[0].DateOfBirth"
                type="date"
                class="border p-2 rounded w-full"
            />
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div
                v-for="item in flight.inventory_items"
                :key="item.InventoryID"
                class="border p-4 rounded-xl text-center hover:bg-gray-50 transition"
            >
                <p class="font-bold">{{ item.ClassCode }}</p>
                <p class="text-2xl text-green-600 font-black">
                    ${{ item.BaseFare }}
                </p>
                <button
                    @click="submitBooking(item.InventoryID)"
                    :disabled="item.TotalSeats - item.SeatsBooked <= 0"
                    class="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg font-bold disabled:bg-gray-400"
                >
                    Book {{ item.ClassCode }}
                </button>
            </div>
        </div>
    </div>
</template> -->
