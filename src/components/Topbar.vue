<template>
  <div class="top-bar">
    <!-- PNG Logo -->
    <img id="logo" src="@/assets/Logo.png" alt="What2Watch Logo">

    <!-- Search Bar -->
    <div class="search-container">
      <span v-on:click="search" class="search-icon">
        <img src="@/assets/Search.svg">
      </span>
      <input v-model="searchQuery" @keyup.enter="search" type="text" class="search-bar" placeholder="Search...">
    </div>

    <!-- Right Side Icons -->
    <div class="right-section">
      <template v-if="!isGuest">
        <div class="user-info">
          <span class="welcome-text">Welcome back!</span>
          <span class="profile-name">{{ username }}</span>
        </div>
        <router-link :to="{ name: 'Profile' }" class="avatar">
          {{ getInitial(username) }}
        </router-link>
        <Logout class="logout-button-topbar" />
      </template>
      <template v-else>
        <button class="login-button" @click="$router.push('/login')">Login</button>
      </template>
    </div>
  </div>
</template>

<script>
import { inject, computed } from 'vue';
import Logout from '@/components/Logout.vue';

export default{
  name: 'Topbar',
  components: {
    Logout
  },
  setup() {
    const currentUser = inject('currentUser');
    const isUserLoaded = inject('isUserLoaded');

    const isGuest = computed(() => currentUser?.value === null);
    const username = computed(() => currentUser?.value?.displayName || 'User');

    return {
      currentUser,
      isUserLoaded,
      isGuest,
      username,
      searchQuery: '',
    }
  },
  methods:{
    search(){
      if(this.searchQuery){
        this.$router.push({name: "results", query: { q: this.searchQuery } })
      }
    },
    getInitial(name) {
      if (name && name.length > 0) {
        return name.charAt(0).toUpperCase();
      }
      return '';
    }
  }
};
</script>

<style scoped>
/* Prevent horizontal scrolling */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow-x: hidden; /* Prevents page from scrolling right */
  width: 100%;
}

/* Top Bar */
.top-bar {
  width: 100%;
  height: auto;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  color: white;
  flex-wrap: wrap;
}

/* PNG Logo */
#logo {
  width: 120px; /* Adjust size */
  height: auto;
}

/* Search Bar */
.search-container {
  display: flex;
  align-items: center;
  background-color: #333;
  border-radius: 20px;
  padding: 5px 10px;
  width: 250px;
  flex-shrink: 0;
}

.search-icon,
.filter-icon {
  font-size: 14px;
  color: white;
  margin: 0 5px;
  cursor: pointer;
}

.search-bar {
  width: 100%;
  height: 30px;
  background: transparent;
  border: none;
  color: white;
  outline: none;
  padding: 0 5px;
  font-family: 'Times New Roman', Times, serif;
  font-size: 1rem;
}

.search-bar::placeholder {
  color: lightgray;
}

.user-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  white-space: nowrap;       /* Prevent internal wrapping */
  overflow: hidden;          /* Hide overflow if needed */
  text-overflow: ellipsis;   /* Ellipsis if too long */
  gap: 5px;
  max-width: 250px;          /* Limit width to prevent pushing */
}

/* Right Section */
.right-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  flex-wrap: nowrap; /* Prevents wrapping */
  min-width: 0;       /* Allow content to shrink */
  overflow: hidden;   /* Hide overflow if needed */
}

.icon-button {
  background: #333;
  border: none;
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
}

.profile-name {
  max-width: 100px;    
  white-space: nowrap;   /* Prevents line breaks */
  overflow: hidden;      
  text-overflow: ellipsis;
  color: #00ff00; /* Green */
  font-weight: bold;
  cursor: pointer;
}

.welcome-text {
  color: white;
  font-weight: 500;
  font-size: 1rem;
}

.login-button {
  width: 100%;
  padding: 8px;
  background-color: #00ff66;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  color: black;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.avatar {
  background: darkgreen;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
}

.logout-button-topbar {
  margin-left: 15px;
  width: auto;
  padding: 8px 15px;
  margin-top: 0;
  margin-bottom: 0;
}
</style>