<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../helpers/api";

const route = useRoute();
const flight = ref(null);

onMounted(async () => {
    // Fetch the specific flight details using the ID from the URL
    const res = await api.get(`/flights/${route.params.id}`);
    flight.value = res.data;
});
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
