<template>
  <div class="onboarding-container">
    <img src="@/assets/Logo.png" alt="What2Watch Logo" class="logo">
    <div class="main-content">
      <div class="questionnaire-container">
        <Questionnaire @submit="handleSubmit" />
      </div>
    </div>
    <div v-if="alert.show" :class="['alert', alert.type]">
      {{ alert.message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase'
import { saveUserOnboardingProfile } from '@/utils/firebaseActions'
import Questionnaire from '../components/Questionnaire.vue'

const router = useRouter()
const alert = ref({
  show: false,
  message: '',
  type: ''
})
const loading = ref(false)

const showAlert = (message, type) => {
  alert.value = { show: true, message, type }
  setTimeout(() => {
    alert.value.show = false
  }, 3000)
}

const handleSubmit = async (formData) => {
  try {
    loading.value = true
    const currentUser = auth.currentUser
    console.log(currentUser)
    if (!currentUser) {
      showAlert('Please log in first', 'error')
      router.push('/login')
      return
    }

    await saveUserOnboardingProfile(formData)

    showAlert('Preferences saved successfully!', 'success')
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  } catch (err) {
    console.error('Error saving preferences:', err)
    showAlert('Failed to save preferences. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.onboarding-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  position: relative;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.logo {
  width: 120px;
  height: auto;
  position: absolute;
  top: 20px;
  left: 20px;
}

h1, h2, h3, h4, h5, h6 {
  color: #00DE64;
}

.main-content {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.questionnaire-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  text-align: center;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.alert.success {
  background-color: #00DE64;
  color: white;
}

.alert.error {
  background-color: #ff6b6b;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>