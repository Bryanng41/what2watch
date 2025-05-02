<template>
  <div class="container">
    <Topbar />
    <div class="bottom-section">
      <Sidebar />
      <div class="content-container">
        <AboutUs />
      </div>
    </div>
  </div>
</template>

<script setup>
import Topbar from '../components/Topbar.vue'
import Sidebar from '../components/Sidebar.vue'
import AboutUs from '../components/AboutUs.vue'
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #0A0A0A;
  overflow: hidden;
}

.bottom-section {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.bottom-section > *:first-child {
  width: 220px;
  flex-shrink: 0;
}

.content-container {
  flex: 1;
  padding: 2rem;
  margin-left: 0;
  max-width: calc(100% - 200px);
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
</style> 