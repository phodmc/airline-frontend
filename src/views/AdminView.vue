<script setup>
import { ref, onMounted } from "vue";
import api from "../helpers/api";

const aircrafts = ref([]);
const airports = ref([]);
const statusMsg = ref("");
const statusClass = ref("");

const form = ref({
    FlightNumber: "",
    DepartureAirportID: null,
    ArrivalAirportID: null,
    AircraftID: null,
    DepartureDateTime: "",
    ArrivalDateTime: "",
    Status: "Scheduled",
    BasePrice: 200,
    businessBasePrice: 0,
    economyBasePrice: 0,
    businessSeats: 0,
    economySeats: 0,
});

// fetch aircraft
onMounted(async () => {
    try {
        const resAircraft = await api.get("/aircrafts");
        const resAirport = await api.get("/airports");

        aircrafts.value = resAircraft.data;
        airports.value = resAirport.data;
    } catch (err) {
        console.error("Could not load aircrafts or airports", err);
    }
});

const createFlight = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        statusMsg.value = "Session expired. Please login again";
    }
    try {
        const payload = {
            ...form.value,
            inventory_items: [
                {
                    ClassCode: "J",
                    TotalSeats: form.value.businessSeats,
                    BaseFare: form.value.businessBasePrice,
                },
                {
                    ClassCode: "Y",
                    TotalSeats: form.value.economySeats,
                    BaseFare: form.value.economyBasePrice,
                },
            ],
        };

        console.log(payload);

        await api.post("/flights", payload);
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

            <div class="col-span-2">
                <label class="block text-sm font-medium">Assign Aircraft</label>
                <select
                    v-model="form.AircraftID"
                    class="w-full border p-2 rounded bg-white"
                    required
                >
                    <option :value="null" disabled>Select an Aircraft</option>
                    <option
                        v-for="plane in aircrafts"
                        :key="plane.AircraftID"
                        :value="plane.AircraftID"
                    >
                        {{ plane.Manufacturer }}-{{ plane.ModelCode }} — (Max
                        Capacity: {{ plane.TotalSeats }})
                    </option>
                </select>
                <p v-if="form.AircraftID" class="text-xs text-gray-500 mt-1">
                    Selected plane cannot exceed
                    {{
                        aircrafts.find((p) => p.AircraftID === form.AircraftID)
                            ?.totalSeats
                    }}
                    total seats.
                </p>
            </div>

            <div>
                <label class="block text-sm font-medium"
                    >Departure Airport</label
                >
                <select
                    v-model="form.DepartureAirportID"
                    class="w-full border p-2 rounded bg-white"
                    required
                >
                    <option :value="null" disabled>Select Departure</option>
                    <option
                        v-for="ap in airports"
                        :key="ap.AirportID"
                        :value="ap.AirportID"
                        :disabled="ap.AirportID === form.ArrivalAirportID"
                    >
                        {{ ap.City }} ({{ ap.IATACode }})
                    </option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium"
                    >Destination Airport</label
                >
                <select
                    v-model="form.ArrivalAirportID"
                    class="w-full border p-2 rounded bg-white"
                    required
                >
                    <option :value="null" disabled>Select Destination</option>
                    <option
                        v-for="ap in airports"
                        :key="ap.AirportID"
                        :value="ap.AirportID"
                        :disabled="ap.AirportID === form.DepartureAirportID"
                    >
                        {{ ap.City }} ({{ ap.IATACode }})
                    </option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium">Departure Time</label>
                <input
                    v-model="form.DepartureDateTime"
                    type="datetime-local"
                    class="w-full border p-2 rounded"
                    required
                />
            </div>

            <div>
                <label class="block text-sm font-medium">Arrival Time</label>
                <input
                    v-model="form.ArrivalDateTime"
                    type="datetime-local"
                    class="w-full border p-2 rounded"
                    required
                />
            </div>

            <div class="col-span-2 border-t pt-4 mt-2">
                <h3 class="font-bold text-blue-800 mb-2">Inventory Setup</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm"
                            >Business Class Seats</label
                        >
                        <input
                            v-model.number="form.businessSeats"
                            type="number"
                            class="w-full border p-2 rounded"
                            placeholder="e.g. 20"
                        />
                    </div>
                    <div>
                        <label class="block text-sm"
                            >Business Class Price</label
                        >
                        <input
                            v-model.number="form.businessBasePrice"
                            type="number"
                            class="w-full border p-2 rounded"
                            placeholder="e.g. 500"
                        />
                    </div>
                    <div>
                        <label class="block text-sm">Economy Class Seats</label>
                        <input
                            v-model.number="form.economySeats"
                            type="number"
                            class="w-full border p-2 rounded"
                            placeholder="e.g. 130"
                        />
                    </div>
                    <div>
                        <label class="block text-sm">Economy Class Price</label>
                        <input
                            v-model.number="form.economyBasePrice"
                            type="number"
                            class="w-full border p-2 rounded"
                            placeholder="e.g. 130"
                        />
                    </div>
                </div>
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
