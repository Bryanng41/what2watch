<template>
  <div class="button-container">
    <button class="get-started-btn" @click="handleClick">
      Get Started
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 2rem 0;
  margin-top: auto;
}

.get-started-btn {
  background-color: #00DE64;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  min-width: 200px;
}

.get-started-btn:hover {
  background-color: #00c758;
  transform: translateY(-2px);
}

.get-started-btn:active {
  transform: translateY(0);
}
</style> 