<script setup>
import RegisterModal from '@/components/RegisterModal.vue';

</script>

<template>
    <div class="register-page">
        <img src="@/assets/Logo.png" alt="What2Watch Logo" class="logo">
        <RegisterModal />
    </div>
</template>

<style scoped>
.register-page {
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