<script setup>
import { ref, onMounted } from "vue";
import api from "../helpers/api"; // Import our axios instance

const loading = ref(true);
const flights = ref([]);
const airports = ref([]);
const searchFilters = ref({
    origin_code: "",
    destination_code: "",
    travel_date: "",
});

const fetchFlights = async () => {
    // Create a copy of the filters
    const params = { ...searchFilters.value };

    // If a field is empty, set it to null so FastAPI's 'Optional' kicks in
    if (!params.travel_date) delete params.travel_date;
    if (!params.origin_code) delete params.origin_code;
    if (!params.destination_code) delete params.destination_code;

    try {
        const res = await api.get("/flights", { params });
        flights.value = res.data;
    } catch (err) {
        console.error("Search failed", err);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    const airportRes = await api.get("/airports");
    airports.value = airportRes.data;
    fetchFlights();
});

const getMinPrice = (inventory) => {
    if (!inventory || inventory.length === 0) return "N/A";
    const prices = inventory.map((item) => item.BaseFare);
    return Math.min(...prices);
};
</script>

<template>
    <div class="p-8">
        <div class="search-bar">
            <div class="input-group">
                <label>From</label>
                <input
                    v-model="searchFilters.origin_code"
                    list="origin-airports"
                    placeholder="e.g. JFK"
                />
                <datalist id="origin-airports">
                    <option
                        v-for="a in airports"
                        :key="a.AirportID"
                        :value="a.IATACode"
                    >
                        {{ a.City }} ({{ a.IATACode }})
                    </option>
                </datalist>
            </div>

            <div class="input-group">
                <label>To</label>
                <input
                    v-model="searchFilters.destination_code"
                    list="dest-airports"
                    placeholder="e.g. LAX"
                />
                <datalist id="dest-airports">
                    <option
                        v-for="a in airports"
                        :key="a.AirportID"
                        :value="a.IATACode"
                    >
                        {{ a.City }} ({{ a.IATACode }})
                    </option>
                </datalist>
            </div>

            <div class="input-group">
                <label>Date</label>
                <input type="date" v-model="searchFilters.travel_date" />
            </div>

            <button @click="fetchFlights" class="search-btn">
                Find Flights
            </button>
        </div>

        <h2 class="text-3xl font-bold mb-4 text-blue-800">Available Flights</h2>

        <div v-if="loading" class="text-gray-500">Scanning the skies...</div>

        <div v-else class="grid gap-4">
            <div
                v-for="flight in flights"
                :key="flight.FlightID"
                class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500"
            >
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-blue-600">
                            Flight #{{ flight.FlightNumber }}
                        </p>
                        <p class="text-xl font-semibold">
                            {{ flight.departure_airport.IATACode }} ➔
                            {{ flight.arrival_airport.IATACode }}
                        </p>
                        <p class="text-sm text-gray-500">
                            {{ flight.departure_airport.City }} to
                            {{ flight.arrival_airport.City }}
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500 uppercase font-bold">
                            Starting At
                        </p>
                        <p class="text-2xl font-bold text-green-600">
                            ${{ getMinPrice(flight.inventory_items) }}
                        </p>
                        <button
                            class="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
