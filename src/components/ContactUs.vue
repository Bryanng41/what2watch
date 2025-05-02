<template>
  <div class="app-container">
    <Topbar />
    <div class="main-container">
      <Sidebar />
      <div class="contact-container">
        <div class="contact-content">
          <h1>Contact Us</h1>
          <div class="contact-info">
            <div class="info-section">
              <h2>Email</h2>
              <p>support@what2watch.com</p>
            </div>
            <div class="info-section">
              <h2>Phone</h2>
              <p>+65 1234 5678</p>
            </div>
            <div class="info-section">
              <h2>Address</h2>
              <p>15 Computing Drive</p>
              <p>Computing 1, #01-01</p>
              <p>Singapore 117417</p>
            </div>
            <div class="info-section">
              <h2>Operating Hours</h2>
              <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Saturday: 10:00 AM - 2:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Topbar from './Topbar.vue';
import Sidebar from './Sidebar.vue';
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #0A0A0A;
}

.main-container {
  display: flex;
  min-height: calc(100vh - 100px);
}

.contact-container {
  flex: 1;
  padding: 2rem;
  color: white;
  margin-left: 0;
  max-width: calc(100% - 200px);
  overflow-x: hidden;
}

.contact-content {
  background: #1A1A1A;
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #00DE64;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.info-section {
  background: #2D2D2D;
  padding: 1.5rem;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.info-section:hover {
  transform: translateY(-5px);
}

h2 {
  color: #00DE64;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

p {
  color: #ddd;
  line-height: 1.6;
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .contact-container {
    margin-left: 0;
    max-width: 100%;
  }
  
  .contact-info {
    grid-template-columns: 1fr;
  }
}
</style> 