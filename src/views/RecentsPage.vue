<template>
  <div class="container">
    <!-- Top Bar -->
    <TopBar 
      v-if="isUserLoaded"
      :isGuest="!currentUser" 
      :username="currentUser?.displayName ?? ''" />
  
    <div class="bottom-section">
      <!-- Sidebar -->
      <SideBar />
  
      <!-- Main Content -->
      <div class="main-content">
        <!-- Recents Component -->
        <Recents ref="recents" @movies-updated="updateMovies" />
      </div>
    </div>
  </div>
</template>

<script>
import { inject, watch } from 'vue';
import TopBar from '@/components/Topbar.vue';
import SideBar from '@/components/Sidebar.vue';
import Recents from '@/components/Recents.vue';

export default {
  components: {
    TopBar,
    SideBar,
    Recents
  },
  data() {
    return {
      movies: [],
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
  },
  methods: {
    updateMovies(newMovies) {
      console.log("Updating movies in RecentsPage:", newMovies?.length || 0);
      this.movies = newMovies ? [...newMovies] : [];
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

.main-content {
  flex: 1;
  padding: 20px;
  margin-left: 50px;
  overflow-y: auto;
}
</style> 