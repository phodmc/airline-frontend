<script setup>
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();

// Grab the PNR from the URL query: /success?pnr=ABCD12
const pnr = route.params.pnr || "XXXXXX";
console.log(pnr);
</script>

<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div
            class="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden"
        >
            <div class="bg-blue-500 p-8 text-center">
                <div
                    class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-sm"
                >
                    <span class="text-4xl">🎉</span>
                </div>
                <h1 class="text-2xl font-bold text-white">
                    Booking Confirmed!
                </h1>
                <p class="text-green-100">You're cleared for takeoff.</p>
            </div>

            <div class="p-8 text-center">
                <p
                    class="text-gray-500 uppercase text-xs font-bold tracking-widest mb-2"
                >
                    Your Booking Reference (PNR)
                </p>
                <div
                    class="bg-gray-100 rounded-xl p-4 mb-6 border-2 border-dashed border-gray-300"
                >
                    <span
                        class="text-4xl font-mono font-black text-blue-900 tracking-widest"
                        >{{ pnr }}</span
                    >
                </div>

                <p class="text-gray-600 mb-8 px-4">
                    A confirmation email has been sent to your inbox. You can
                    manage your seats or check-in using this PNR.
                </p>

                <div class="space-y-3">
                    <button
                        @click="router.push('/my-bookings')"
                        class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                    >
                        View My Bookings
                    </button>
                    <button
                        @click="router.push('/')"
                        class="w-full bg-white text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>

            <div class="bg-gray-50 p-4 text-center border-t border-gray-100">
                <p class="text-xs text-gray-400">
                    Thank you for flying with us!
                </p>
            </div>
        </div>
    </div>
</template>
