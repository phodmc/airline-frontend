<script setup>
// Logic will go here later

import { checkLogin, logout, isLoggedIn } from "./helpers/auth";
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

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
                    <RouterLink to="/admin" class="mx-2 hover:underline"
                        >Admin Panel</RouterLink
                    >
                    <button
                        @click="logout"
                        class="text-red-200 hover:text-white"
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
