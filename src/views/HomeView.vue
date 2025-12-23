<script setup>
import { ref, onMounted } from "vue";
import api from "../helpers/api"; // Import our axios instance

const flights = ref([]);
const loading = ref(true);

onMounted(async () => {
    try {
        const response = await api.get("/flights"); // Matches your FastAPI route
        flights.value = response.data;
    } catch (error) {
        console.error("Ground control to Major Tom, we have a problem:", error);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="p-8">
        <h2 class="text-3xl font-bold mb-4 text-blue-800">Available Flights</h2>

        <div v-if="loading" class="text-gray-500">Scanning the skies...</div>

        <div v-else class="grid gap-4">
            <div
                v-for="flight in flights"
                :key="flight.FlightID"
                class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500"
            >
                <p class="font-bold text-lg">
                    Flight #{{ flight.FlightNumber }}
                </p>

                <p class="text-lg">
                    From:
                    <span class="font-bold">{{
                        flight.departure_airport.Name
                    }}</span>
                </p>

                <p class="text-lg">
                    To:
                    <span class="font-bold">{{
                        flight.arrival_airport.Name
                    }}</span>
                </p>

                <p class="text-gray-600">
                    Status:
                    <span class="text-green-600">{{ flight.Status }}</span>
                </p>
            </div>
        </div>
    </div>
</template>
