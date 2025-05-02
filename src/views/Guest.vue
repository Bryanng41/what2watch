<template>
  <div class="container">
    <!-- Top Bar -->
    <TopBar :isGuest="true" />

    <div class="bottom-section">
      <!-- Sidebar -->
      <SideBar :isGuest="true"/>

      <!-- Main Dashboard Content -->
      <DashboardContent :isGuest="true"/>
    </div>
  </div>
</template>

<script>
import TopBar from '@/components/Topbar.vue';
import SideBar from '@/components/Sidebar.vue';
import DashboardContent from '@/components/DashboardContent.vue';

export default {
  name: 'Guest',
  components: {
    TopBar,
    SideBar,
    DashboardContent
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: black;
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
</style>