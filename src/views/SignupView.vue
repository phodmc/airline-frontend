<script setup>
import { ref } from "vue";
import api from "@/helpers/api";
import { useRouter } from "vue-router";

const router = useRouter();

const form = ref({
    FirstName: "",
    LastName: "",
    Email: "",
    Password: "",
});

const loading = ref(false);
const errorMessage = ref("");

const handleSignup = async () => {
    loading.value = true;
    errorMessage.value = "";

    try {
        // Sends FirstName, LastName, Email, Password to your backend
        await api.post("/users/register", form.value);
        router.push("/login?message=Account created successfully!");
    } catch (err) {
        console.error("Signup error:", err);
        errorMessage.value =
            err.response?.data?.detail || "Registration failed.";
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div
        class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
        <div
            class="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-300"
        >
            <div>
                <h2
                    class="mt-1 text-center text-3xl font-extrabold text-blue-900"
                >
                    Create Account
                </h2>
            </div>

            <form class="mt-8 space-y-6" @submit.prevent="handleSignup">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700"
                            >First Name</label
                        >
                        <input
                            v-model="form.FirstName"
                            type="text"
                            required
                            class="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700"
                            >Last Name</label
                        >
                        <input
                            v-model="form.LastName"
                            type="text"
                            required
                            class="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700"
                        >Email Address</label
                    >
                    <input
                        v-model="form.Email"
                        type="email"
                        required
                        class="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="email@example.com"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700"
                        >Password</label
                    >
                    <input
                        v-model="form.Password"
                        type="password"
                        required
                        class="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="••••••••"
                    />
                </div>

                <div
                    v-if="errorMessage"
                    class="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200"
                >
                    {{ errorMessage }}
                </div>

                <button
                    :disabled="loading"
                    type="submit"
                    class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg"
                >
                    {{ loading ? "Processing..." : "Register" }}
                </button>

                <div class="text-center">
                    <router-link
                        to="/login"
                        class="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                        Already have an account? Sign in
                    </router-link>
                </div>
            </form>
        </div>
    </div>
</template>
