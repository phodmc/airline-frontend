<template>
    <div class="min-h-screen bg-gray-100">
        <header
            class="bg-orange-600 text-white p-4 shadow-md flex justify-between"
        >
            <h1 class="text-2xl font-bold">Aries Airways</h1>
            <nav>
                <RouterLink to="/" class="mx-2 hover:underline"
                    >Search</RouterLink
                >
                <RouterLink to="/login" class="mx-2 hover:underline"
                    >Login</RouterLink
                >
            </nav>
        </header>

        <main>
            <RouterView />
        </main>
    </div>
</template>

<script setup>
// Logic will go here later
</script>
