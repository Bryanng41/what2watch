<template>
  <div class="container">
    <!-- Top Bar -->
    <TopBar />

    <div class="bottom-section">
      <!-- Sidebar -->
      <SideBar />

      <SearchResult class="main-content"/>
    </div>

  </div>
</template>

<script>
import TopBar from "@/components/Topbar.vue";
import SideBar from "@/components/Sidebar.vue";
import SearchResult from "@/components/SearchResult.vue";

export default {
  components: {
    TopBar,
    SideBar,
    SearchResult,
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: black;
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
  overflow-y: auto;
  color: white;
}

</style>