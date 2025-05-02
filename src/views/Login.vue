<script setup>
import LoginModal from '@/components/LoginModal.vue'
</script>

<template>
    <div class="login-page">
        <img src="@/assets/Logo.png" alt="What2Watch Logo" class="logo">
        <LoginModal />
    </div>
</template>

<style scoped>
.login-page {
    min-height: 100vh;
    background-color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

.logo {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 120px;
    height: auto;
}
</style>

