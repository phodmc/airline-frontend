<script setup>
import { ref, onMounted } from "vue";
import api from "@/helpers/api";

const bookings = ref([]);
const loading = ref(false);

const fetchBookings = async () => {
    loading.value = true;

    try {
        const res = await api.get("/bookings/me");
        bookings.value = res.data;
    } catch (err) {
        console.error("Error: ", err);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchBookings);
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-6xl mx-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold text-blue-900">My Flights</h2>
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
                v-else-if="!loading && bookings.length === 0"
                class="bg-white p-12 rounded-xl text-center border-2 border-dashed border-gray-200"
            >
                <p class="text-gray-500 text-lg">
                    You haven't booked any flights yet.
                </p>
            </div>

            <div v-else class="grid gap-6">
                <div
                    v-for="booking in bookings"
                    :key="booking.BookingID"
                    class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow border-l-8 border-l-blue-500"
                >
                    <div
                        class="flex flex-col md:flex-row justify-between items-center gap-6"
                    >
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-2">
                                <span
                                    class="text-blue-600 text-2xl rounded font-bold uppercase"
                                    >PNR</span
                                >
                                <span
                                    class="font-mono bg-green-600 text-amber-50 tracking-wider px-2 py-0.5 rounded text-2xl"
                                    >{{ booking.PNR }}</span
                                >
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-center">
                                    <p
                                        class="text-3xl font-black text-gray-800"
                                    >
                                        {{
                                            booking.flight.departure_airport
                                                .IATACode
                                        }}
                                    </p>
                                    <p class="text-sm text-gray-500">
                                        {{
                                            booking.flight.departure_airport
                                                .City
                                        }}
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
                                        >{{ booking.BookingStatus }}</span
                                    >
                                </div>
                                <div class="text-center">
                                    <p
                                        class="text-3xl font-black text-gray-800"
                                    >
                                        {{
                                            booking.flight.arrival_airport
                                                .IATACode
                                        }}
                                    </p>
                                    <p class="text-sm text-gray-500">
                                        {{
                                            booking.flight.arrival_airport.City
                                        }}
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
                                    Price
                                </p>
                                <p
                                    class="text-4xl font-black text-green-600 tracking-tighter"
                                >
                                    {{ booking.TotalAmount }}
                                </p>
                            </div>
                            <button
                                @click="
                                    router.push(`/book/${booking.FlightID}`)
                                "
                                class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-transform active:scale-95 shadow-lg"
                            >
                                Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
