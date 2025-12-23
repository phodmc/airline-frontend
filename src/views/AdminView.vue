<script setup>
import { ref } from "vue";
import api from "../helpers/api";

const statusMsg = ref("");
const statusClass = ref("");

const form = ref({
    FlightNumber: "",
    OriginAirportID: null,
    DestinationAirportID: null,
    DepartureTime: "",
    ArrivalTime: "",
    Status: "Scheduled",
});

const createFlight = async () => {
    try {
        await api.post("/admin/flights", form.value);
        statusMsg.value = "Flight successfully dispatched!";
        statusClass.value = "bg-green-100 text-green-700";
        // Clear form
    } catch (err) {
        statusMsg.value =
            err.response?.data?.detail ||
            "Error: Check your admin permissions.";
        statusClass.value = "bg-red-100 text-red-700";
    }
};
</script>

<template>
    <div class="p-8 max-w-2xl mx-auto">
        <h2 class="text-3xl font-bold mb-6 text-gray-800">
            Dispatch New Flight
        </h2>

        <form
            @submit.prevent="createFlight"
            class="bg-white p-6 rounded-lg shadow-md grid grid-cols-2 gap-4"
        >
            <div class="col-span-2">
                <label class="block text-sm font-medium">Flight Number</label>
                <input
                    v-model="form.FlightNumber"
                    type="text"
                    placeholder="e.g. AA101"
                    class="w-full border p-2 rounded"
                    required
                />
            </div>

            <div>
                <label class="block text-sm font-medium">Origin Port ID</label>
                <input
                    v-model.number="form.OriginAirportID"
                    type="number"
                    class="w-full border p-2 rounded"
                    required
                />
            </div>

            <div>
                <label class="block text-sm font-medium">Dest Port ID</label>
                <input
                    v-model.number="form.DestinationAirportID"
                    type="number"
                    class="w-full border p-2 rounded"
                    required
                />
            </div>

            <div>
                <label class="block text-sm font-medium">Departure Time</label>
                <input
                    v-model="form.DepartureTime"
                    type="datetime-local"
                    class="w-full border p-2 rounded"
                    required
                />
            </div>

            <div>
                <label class="block text-sm font-medium">Arrival Time</label>
                <input
                    v-model="form.ArrivalTime"
                    type="datetime-local"
                    class="w-full border p-2 rounded"
                    required
                />
            </div>

            <button
                type="submit"
                class="col-span-2 bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition"
            >
                Confirm & Save to Database
            </button>
        </form>

        <p v-if="statusMsg" :class="statusClass" class="mt-4 p-3 rounded">
            {{ statusMsg }}
        </p>
    </div>
</template>
