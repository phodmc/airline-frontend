<script setup>
import { ref } from "vue";
import api from "../helpers/api";
import { checkAdmin, checkLogin } from "../helpers/auth";
import { useRouter } from "vue-router";

const email = ref("");
const inputType = ref("password");
const password = ref("");
const errorMessage = ref("");
const router = useRouter();

const handleLogin = async () => {
    try {
        // Note: FastAPI OAuth2 expects form-data, not JSON by default
        const formData = new FormData();
        formData.append("username", email.value); // FastAPI uses 'username' field
        formData.append("password", password.value);

        const response = await api.post("users/token", formData);

        // Save the token!
        localStorage.setItem("token", response.data.access_token);

        checkLogin();
        checkAdmin();

        // Redirect to home or admin dashboard
        await router.push("/");
    } catch (error) {
        errorMessage.value = "Invalid credentials. Unauthorized access logged.";
    }
};

const showPassword = () => {
    inputType.value = inputType.value === "password" ? "text" : "password";
};
</script>

<template>
    <div class="flex justify-center items-center mt-20">
        <form
            @submit.prevent="handleLogin"
            class="bg-white p-8 rounded shadow-lg w-96"
        >
            <h2 class="text-2xl font-bold mb-6 text-blue-800">Staff Login</h2>

            <div class="mb-4">
                <label class="block text-gray-700">Email</label>
                <input
                    v-model="email"
                    type="email"
                    class="w-full border p-2 rounded mt-1"
                    required
                />
            </div>

            <div class="mb-6">
                <label class="block text-gray-700">Password</label>
                <input
                    v-model="password"
                    class="w-full border p-2 rounded mt-1"
                    required
                    :type="inputType"
                />
                <input
                    @click="showPassword"
                    type="checkbox"
                    name="showPassword"
                    id="showPassword"
                />
                <label class="ml-2" for="showPassword">Show password</label>
            </div>

            <button
                type="submit"
                class="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
            >
                Enter Cockpit
            </button>

            <p v-if="errorMessage" class="text-red-500 mt-4 text-sm">
                {{ errorMessage }}
            </p>
        </form>
    </div>
</template>
