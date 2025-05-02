import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Views and Components
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import ForgetPassword from '@/views/ForgetPassword.vue';
import Guest from '@/views/Guest.vue';
import Dashboard from '@/views/Dashboard.vue';
import SearchResult from '@/views/SearchResultPage.vue';
import Onboarding from '@/views/Onboarding.vue';
import Profile from '@/views/Profile.vue';
import WatchlisDisplay from '@/views/WatchlistPage.vue';
import RecentsPage from '@/views/RecentsPage.vue';
import ContactUs from '@/components/ContactUs.vue';
import MovieDetails from '@/components/MovieDetails.vue';
import AboutUs from '@/views/AboutUs.vue';

const routes = [
  {
    path: '/',
    name: 'Root',
    component: Guest // fallback until redirect logic kicks in
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/results',
    name: 'results',
    component: SearchResult
  },
  {
    path: '/forget-password',
    name: 'ForgetPassword',
    component: ForgetPassword
  },
  {
    path: '/guest',
    name: 'Guest',
    component: Guest
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: Onboarding,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/watchlist',
    name: 'WatchList',
    component: WatchlisDisplay
  },
  {
    path: '/recents',
    name: 'Recents',
    component: RecentsPage
  },
  {
    path: '/contact',
    name: 'ContactUs',
    component: ContactUs
  },
  {
    path: '/movie',
    name: 'MovieDetails',
    component: MovieDetails
  },
  {
    path: '/about',
    name: 'AboutUs',
    component: AboutUs
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Flag to check if auth has been initialized
let isAuthChecked = false;

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  if (!isAuthChecked) {
    await new Promise((resolve) => {
      onAuthStateChanged(auth, () => resolve());
    });
    isAuthChecked = true;
  }

  const currentUser = auth.currentUser;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // Root redirect
  if (to.path === '/') {
    return currentUser ? next('/dashboard') : next('/guest');
  }

  // Auth-only pages
  if (requiresAuth && !currentUser) {
    return next('/login');
  }

  next();
});

export default router;