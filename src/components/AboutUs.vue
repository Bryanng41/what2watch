<template>
  <div class="about-container">
    <div class="about-content">
      <h1>About What2Watch</h1>
      
      <div class="section">
        <h2>Our Mission</h2>
        <p>What2Watch is your ultimate destination for discovering your next favorite movie. We're dedicated to making movie discovery personalized, engaging, and effortless. Our platform combines powerful recommendation algorithms with user preferences to help you find the perfect film for any mood or occasion.</p>
      </div>

      <div class="section">
        <h2>What We Offer</h2>
        <div class="features">
          <div class="feature">
            <h3>Personalized Recommendations</h3>
            <p>Get movie suggestions tailored to your taste, based on your watching history, preferred genres, and favorite directors.</p>
          </div>
          <div class="feature">
            <h3>Streaming Availability</h3>
            <p>Instantly see where you can watch your favorite movies across popular streaming platforms like Netflix, Amazon Prime, and Disney+.</p>
          </div>
          <div class="feature">
            <h3>Comprehensive Information</h3>
            <p>Access detailed movie information including ratings, reviews, cast details, and release dates to make informed decisions.</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>How It Works</h2>
        <ol class="steps">
          <li>Create your profile and set your preferences</li>
          <li>Browse through personalized movie recommendations</li>
          <li>Add movies to your watchlist for later</li>
          <li>Track your watching history and discover new favorites</li>
        </ol>
      </div>

      <div class="section">
        <h2>Our Data</h2>
        <p>What2Watch uses data from The Movie Database (TMDB) to provide accurate and up-to-date information about movies. Our platform is constantly updated with the latest releases, ratings, and streaming availability information.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  width: 80%;
  background-color: black;
  color: white;
  padding: 20px 40px 20px 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}

.about-content {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 1em;
  color: #00DE64;
  font-family: 'Times New Roman', Times, serif;
}

.section {
  margin-bottom: 2em;
}

h2 {
  font-size: 1.8em;
  margin-bottom: 0.8em;
  color: #00DE64;
  font-family: 'Times New Roman', Times, serif;
}

p {
  line-height: 1.6;
  margin-bottom: 1em;
  font-size: 1.1em;
  color: #ccc;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2em;
  margin-top: 1em;
}

.feature {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5em;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature h3 {
  color: #00DE64;
  margin-bottom: 0.5em;
  font-size: 1.3em;
  font-family: 'Times New Roman', Times, serif;
}

.steps {
  list-style-position: inside;
  padding-left: 1em;
  color: #ccc;
}

.steps li {
  margin-bottom: 0.8em;
  font-size: 1.1em;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .about-container {
    width: 95%;
    padding: 15px;
  }

  h1 {
    font-size: 2em;
  }

  h2 {
    font-size: 1.5em;
  }

  .features {
    grid-template-columns: 1fr;
  }
}
</style> 