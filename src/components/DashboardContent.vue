<template>
  <div class="dashboard-content">
    <div class="content-wrapper">
      <PopularCarousel />
      <TasteReel v-if="!isGuest" />
      <TopRatedReel />
    </div>
  </div>
</template>

<script setup>
import PopularCarousel from './PopularCarousel.vue';
import TasteReel from './TasteReel.vue';
import TopRatedReel from './TopRatedReel.vue';

defineProps({
  isGuest: Boolean
});
</script>

<style scoped>
.dashboard-content {
  flex: 1;
  padding: 20px 40px;
  color: white;
  overflow-y: auto;
  position: relative;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding-bottom: 20px;
}
</style>