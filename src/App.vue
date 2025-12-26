<script setup>
// Logic will go here later

import { checkLogin, isLoggedIn, isAdmin } from "./helpers/auth";
import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const logout = () => {
    localStorage.removeItem("token");
    isLoggedIn.value = false;
    router.push("/login");
};

watch(() => route.path, checkLogin);
onMounted(checkLogin);
</script>

<template>
    <div class="min-h-screen bg-gray-100">
        <header
            class="bg-blue-600 text-white p-4 shadow-md flex justify-between"
        >
            <RouterLink to="/" class="mx-2"
                ><h1 class="text-2xl font-bold">Aries Airways</h1></RouterLink
            >
            <nav>
                <RouterLink to="/" class="mx-2 hover:underline"
                    >Search</RouterLink
                >
                <RouterLink
                    v-if="!isLoggedIn"
                    to="/login"
                    class="hover:underline"
                    >Login</RouterLink
                >
                <template v-else>
                    <RouterLink
                        v-if="isAdmin"
                        to="/admin"
                        class="mx-2 hover:underline"
                        >Admin Panel</RouterLink
                    >
                    <RouterLink
                        v-else
                        to="/profile"
                        class="mx-2 hover:underline"
                        >Booking</RouterLink
                    >
                    <button
                        @click="logout"
                        class="text-red-200 hover:text-white hover:bg-red-800 py-1.5 px-3 bg-red-500 rounded-sm"
                    >
                        Logout
                    </button>
                </template>
            </nav>
        </header>

        <main>
            <RouterView />
        </main>
    </div>
</template>
