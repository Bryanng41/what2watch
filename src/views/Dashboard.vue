<template>
  <div class="container">
    <!-- Top Bar -->
    <TopBar 
      v-if="isUserLoaded"
      :isGuest="!currentUser" 
      :username="currentUser?.displayName ?? ''" />

    <div class="bottom-section">
      <!-- Sidebar -->
      <SideBar :isGuest="!currentUser" />

      <!-- Main Dashboard Content -->
      <DashboardContent :isGuest="!currentUser" />
    </div>
  </div>
</template>

<script>
import { inject, watch } from 'vue';

import TopBar from '@/components/Topbar.vue';
import SideBar from '@/components/Sidebar.vue';
import DashboardContent from '@/components/DashboardContent.vue';

export default {
  name: 'Dashboard',
  components: {
    TopBar,
    SideBar,
    DashboardContent
  },
  data() {
    return {
      currentUser: null,
      isUserLoaded: false
    };
  },
  created() {
    const userRef = inject('currentUser');
    const loadedRef = inject('isUserLoaded');

    if (userRef) {
      this.currentUser = userRef.value;
      watch(userRef, (newVal) => {
        this.currentUser = newVal;
      });
    }

    if (loadedRef) {
      this.isUserLoaded = loadedRef.value;
      watch(loadedRef, (val) => {
        this.isUserLoaded = val;
      });
    }
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