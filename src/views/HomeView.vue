<script setup>
import { ref, onMounted } from "vue";
import api from "../helpers/api"; // Import our axios instance

import { useRouter } from "vue-router";

const loading = ref(false);
const searchPressed = ref(false);
const flights = ref([]);
const airports = ref([]);
const searchFilters = ref({
    origin_code: "",
    destination_code: "",
    travel_date: "",
});

const router = useRouter();

const fetchFlights = async () => {
    // check if origin is empty
    if (!searchFilters.value.origin_code.trim()) {
        alert("Please select a departure airport (From) to begin your search.");
        return; // Stop the function here
    }

    loading.value = true;
    searchPressed.value = true;
    const params = { ...searchFilters.value };

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

const clearFilters = () => {
    searchFilters.value = {
        origin_code: "",
        destination_code: "",
        travel_date: "",
    };
    searchPressed.value = false;
    loading.value = false;
    // fetchFlights();
};

onMounted(async () => {
    try {
        const airportRes = await api.get("/airports");
        airports.value = airportRes.data;
        // await fetchFlights();
    } catch (err) {
        console.error("Initial load failed", err);
    }
});

const getMinPrice = (inventory) => {
    if (!inventory || inventory.length === 0) return "N/A";
    const prices = inventory.map((item) => item.BaseFare);
    return Math.min(...prices);
};

const getAvailabilityClass = (remaining) => {
    if (remaining <= 0) return "text-red-600";
    if (remaining < 10) return "text-orange-500"; // Warning color
    return "text-green-600";
};

const getAvailableSeats = (inventory) => {
    if (!inventoryItems || !Array.items) return 0;

    const total = inventory.reduce((total, item) => {
        return total + item.SeatsAvailable;
    }, 0);

    return total;
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <div
            class="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8"
        >
            <h2 class="text-xl font-bold text-gray-800 mb-4">Search Flights</h2>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div class="flex flex-col">
                    <label
                        class="text-xs font-bold text-gray-500 uppercase mb-1"
                        >From <span class="text-red-500">*</span></label
                    >
                    <input
                        v-model="searchFilters.origin_code"
                        list="origin-airports"
                        placeholder="City or Code"
                        class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div class="flex flex-col">
                    <label
                        class="text-xs font-bold text-gray-500 uppercase mb-1"
                        >To</label
                    >
                    <input
                        v-model="searchFilters.destination_code"
                        list="dest-airports"
                        placeholder="City or Code"
                        class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div class="flex flex-col">
                    <label
                        class="text-xs font-bold text-gray-500 uppercase mb-1"
                        >Departure Date</label
                    >
                    <input
                        type="date"
                        v-model="searchFilters.travel_date"
                        class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div class="flex gap-2">
                    <button
                        @click="fetchFlights"
                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition shadow-md"
                    >
                        Search
                    </button>
                    <button
                        @click="clearFilters"
                        class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition"
                        title="Clear All"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <datalist id="origin-airports">
                <option
                    v-for="a in airports"
                    :key="a.AirportID"
                    :value="a.IATACode"
                >
                    {{ a.City }} ({{ a.IATACode }})
                </option>
            </datalist>
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

        <div class="max-w-6xl mx-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold text-blue-900">
                    Available Flights
                </h2>

                <div
                    v-if="!loading && searchPressed"
                    class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase"
                >
                    {{ flights.length }} Found
                </div>
            </div>

            <!-- loading or empty page -->
            <div
                v-if="loading"
                class="flex flex-col items-center py-20 text-gray-400"
            >
                <div
                    class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"
                ></div>
                <p>Scanning the skies for the best deals...</p>
            </div>

            <div
                v-else-if="!loading && !searchPressed"
                class="text-center py-20"
            >
                <div class="text-6xl mb-4">🌍</div>
                <h3 class="text-xl font-bold text-gray-700">
                    Where would you like to go?
                </h3>
                <p class="text-gray-500">
                    Enter an origin and destination to view available flights.
                </p>
            </div>

            <div
                v-else-if="!loading && searchPressed && flights.length === 0"
                class="bg-white p-12 rounded-xl text-center border-2 border-dashed border-gray-200"
            >
                <p class="text-gray-500 text-lg">
                    No flights match your search. Try different cities or dates!
                </p>
            </div>

            <!-- actual flights -->
            <div v-else class="grid gap-6">
                <div
                    v-for="flight in flights"
                    :key="flight.FlightID"
                    class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow border-l-8 border-l-blue-500"
                >
                    <div
                        class="flex flex-col md:flex-row justify-between items-center gap-6"
                    >
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span
                                    class="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                                    >Flight</span
                                >
                                <span class="font-mono text-gray-600 font-bold"
                                    >#{{ flight.FlightNumber }}</span
                                >
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-center">
                                    <p
                                        class="text-3xl font-black text-gray-800"
                                    >
                                        {{ flight.departure_airport.IATACode }}
                                    </p>
                                    <p class="text-sm text-gray-500">
                                        {{ flight.departure_airport.City }}
                                    </p>
                                </div>
                                <div
                                    class="flex flex-col items-center flex-1 px-4"
                                >
                                    <div
                                        class="w-full border-t-2 border-dashed border-gray-300 relative"
                                    >
                                        <span
                                            class="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-blue-500"
                                            >✈</span
                                        >
                                    </div>
                                    <span
                                        class="text-[10px] text-gray-400 mt-2 uppercase tracking-widest"
                                        >{{ flight.Status }}</span
                                    >
                                </div>
                                <div class="text-center">
                                    <p
                                        class="text-3xl font-black text-gray-800"
                                    >
                                        {{ flight.arrival_airport.IATACode }}
                                    </p>
                                    <p class="text-sm text-gray-500">
                                        {{ flight.arrival_airport.City }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            class="flex flex-row md:flex-col items-center md:items-end gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8"
                        >
                            <div class="flex-1 md:text-right">
                                <p
                                    class="text-xs text-gray-400 uppercase font-bold tracking-tighter"
                                >
                                    Starting At
                                </p>
                                <p
                                    class="text-4xl font-black text-green-600 tracking-tighter"
                                >
                                    ${{ getMinPrice(flight.inventory_items) }}
                                </p>
                            </div>

                            <div class="flex flex-col">
                                <span
                                    :class="
                                        getAvailabilityClass(
                                            flight.TotalSeats -
                                                flight.SeatsBooked,
                                        )
                                    "
                                    class="text-xs font-bold uppercase"
                                >
                                    {{
                                        getAvailableSeats(
                                            flight.inventory_items,
                                        )
                                    }}
                                    seats remaining
                                </span>
                            </div>

                            <!-- <button
                                @click="router.push(`/book/${flight.FlightID}`)"
                                class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-transform active:scale-95 shadow-lg"
                            >
                                Book Now
                            </button> -->
                            <button
                                @click="router.push(`/book/${flight.FlightID}`)"
                                class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-transform active:scale-95 shadow-lg"
                                :disabled="
                                    flight.TotalSeats - flight.SeatsBooked <= 0
                                "
                            >
                                {{
                                    flight.TotalSeats - flight.SeatsBooked <= 0
                                        ? "Sold Out"
                                        : "Book Now"
                                }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
