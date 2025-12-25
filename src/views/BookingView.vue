<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../helpers/api";

const route = useRoute();
const flight = ref(null);

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

const submitBooking = async (inventoryId) => {
    // Update the InventoryID for all passengers in this set
    passengers.value.forEach((p) => (p.InventoryID = inventoryId));

    try {
        const payload = {
            passengers: passengers.value,
        };

        const res = await api.post("/bookings", payload);
        alert(`Success! Your PNR is: ${res.data.PNR}`);
        router.push("/");
    } catch (err) {
        alert("Error: " + (err.response?.data?.detail || "Booking failed"));
    }
};

const handleBooking = async (item) => {
    // item is the specific inventory object { ClassCode: 'Economy', BaseFare: 200, ... }
    const confirmed = confirm(
        `Confirm booking for ${item.ClassCode} at $${item.BaseFare}?`,
    );

    if (confirmed) {
        try {
            await api.post("/bookings", {
                flight_id: flight.value.FlightID,
                class_code: item.ClassCode,
            });
            alert("Booking Successful!");
            router.push("/my-bookings"); // Or wherever you track history
        } catch (err) {
            alert(err.response?.data?.detail || "Error creating booking");
        }
    }
};

const confirmBooking = async (classCode) => {
    try {
        await api.post("/bookings", {
            flight_id: flight.value.FlightID,
            class_code: classCode,
        });
        alert("Pack your bags! Booking confirmed.");
        router.push("/profile"); // Send them to see their tickets
    } catch (err) {
        alert("Booking failed: " + err.response.data.detail);
    }
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

        <div class="space-y-4 mb-8">
            <h2 class="font-bold text-2xl pb-1 pt-3">Passenger Information</h2>
            <div class="grid grid-cols-2 gap-4">
                <input
                    v-model="passengers[0].FirstName"
                    placeholder="First Name"
                    class="border border-blue-600 p-2 rounded"
                />
                <input
                    v-model="passengers[0].LastName"
                    placeholder="Last Name"
                    class="border border-blue-600 p-2 rounded"
                />
            </div>
            <input
                v-model="passengers[0].PassportNumber"
                placeholder="Passport Number"
                class="border border-blue-600 p-2 rounded w-full"
            />
            <label for="db">date of birth</label>
            <input
                id="db"
                v-model="passengers[0].DateOfBirth"
                type="date"
                class="border border-blue-600 p-2 rounded w-full"
            />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div
                v-for="item in flight.inventory_items"
                :key="item.ClassCode"
                class="border-2 p-6 rounded-xl hover:border-blue-500 transition cursor-pointer bg-white"
                @click="confirmBooking(item.ClassCode)"
            >
                <h3 class="text-xl font-bold">
                    {{ item.ClassCode == "Y" ? "Economy" : "Business" }}
                </h3>
                <p class="text-3xl font-black text-blue-600 mt-2">
                    ${{ item.BaseFare }}
                </p>
                <p class="text-sm text-gray-500 mt-1">
                    {{ item.TotalSeats }} seats remaining
                </p>
                <button
                    class="w-full mt-4 bg-gray-800 text-white py-2 rounded-lg font-bold"
                >
                    Select {{ item.ClassCode == "Y" ? "Economy" : "Business" }}
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
