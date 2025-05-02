<template>
  <div class="sidebar">
    <div class="menu-section">
      <h3>Menu</h3>
      <ul>
        <li :class="{ 'active': $route.name === 'Dashboard' || $route.name === 'Guest' }" @click="goToDiscover">
          <span class="router-link">Discover</span>
        </li>
      </ul>
    </div>

    <div class="menu-section">
      <h3>Library</h3>
      <ul>
        <li :class="{ 'active': $route.name === 'Recents' }" @click="handleProtectedRoute('Recents')">
          <span class="router-link">Recents</span>
        </li>
        <li :class="{ 'active': $route.name === 'WatchList' }" @click="handleProtectedRoute('WatchList')">
          <span class="router-link">Watchlist</span>
        </li>
      </ul>
    </div>

    <div class="menu-section">
      <h3>General</h3>
      <ul>
        <li :class="{ 'active': $route.name === 'AboutUs' }">
          <router-link class="router-link" :to="{ name: 'AboutUs' }">About Us</router-link>
        </li>
        <li :class="{ 'active': $route.name === 'ContactUs' }">
          <router-link class="router-link" :to="{ name: 'ContactUs' }">Contact Us</router-link>
        </li>
        <li :class="{ 'active': $route.path === '/profile' }">
          <router-link :to="{ path: '/profile', query: { tab: 'settings' } }" class="router-link">Settings</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { auth } from '@/firebase'

const router = useRouter()

const handleProtectedRoute = (routeName) => {
  const user = auth.currentUser
  if (!user) {
    alert('Please log in to access this feature.')
    return
  }
  router.push({ name: routeName })
}

const goToDiscover = () => {
  const user = auth.currentUser
  const target = user ? { name: 'Dashboard' } : { name: 'Guest' }
  router.push(target)
}

defineProps({
  isGuest: Boolean
})
</script>

<style scoped>
.sidebar {
  width: 200px;
  min-width: 200px;
  background-color: black;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.menu-section {
  margin-bottom: 20px;
}

h3 {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: gray;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 8px 0;
  font-size: 16px;
  cursor: pointer;
  padding-left: 15px;
  position: relative;
}

li:hover {
  color: lightgray;
}

.router-link {
  color: white;
  text-decoration: none;
  display: block;
  padding: 10px 0;
  transition: color 0.3s ease;
}

.router-link:hover {
  color: #00DE64;
}

li.active {
  color: #00DE64;
}

li.active::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 3px;
  background-color: #00DE64;
}

li.active .router-link {
  color: #00DE64;
}
</style>
