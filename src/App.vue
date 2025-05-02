<template>
  <div id="app">
    <div class="honeycomb-overlay"></div>
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const currentUser = ref(null);
const isUserLoaded = ref(false);

onMounted(() => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    isUserLoaded.value = true;
  });
});

provide('currentUser', currentUser);
provide('isUserLoaded', isUserLoaded);
</script> 


<style>
body {
  margin: 0;
  padding: 0;
  background-color: rgb(0, 0, 0);
}

#app {
  position: relative;
  min-height: 100vh;
}

.honeycomb-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/honeycomb_BG.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.1;
  z-index: 0;
  pointer-events: none;
}

.router-view {
  position: relative;
  z-index: 1;
}

/* Ensure all components are above the overlay */
.router-view > * {
  position: relative;
  z-index: 1;
}
</style>
