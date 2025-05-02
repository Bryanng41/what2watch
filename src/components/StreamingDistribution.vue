<template>
  <div class="distribution-container">
    <h2>Streaming Distribution</h2>
    <div class="platform-stats">
      <div class="platform">
        <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" class="platform-logo">
        <div class="count">{{ netflixCount }}</div>
      </div>
      <div class="platform">
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" alt="Disney+" class="platform-logo">
        <div class="count">{{ disneyCount }}</div>
      </div>
      <div class="platform">
        <img src="https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg" alt="Amazon Prime Video" class="platform-logo">
        <div class="count">{{ amazonCount }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StreamingDistribution',
  props: {
    movies: {
      type: Array,
      required: true
    }
  },
  computed: {
    netflixCount() {
      return this.movies.filter(movie => movie.providers.includes('Netflix')).length;
    },
    disneyCount() {
      return this.movies.filter(movie => movie.providers.includes('Disney Plus')).length;
    },
    amazonCount() {
      return this.movies.filter(movie => movie.providers.includes('Amazon')).length;
    }
  },
  methods: {
    countMoviesByProvider() {
      this.providerCounts = {
        'Amazon': 0,
        'Netflix': 0,
        'Disney Plus': 0
      };

      this.movies.forEach(movie => {
        if (movie.providers.includes('Amazon')) {
          this.providerCounts['Amazon']++;
        }
        if (movie.providers.includes('Netflix')) {
          this.providerCounts['Netflix']++;
        }
        if (movie.providers.includes('Disney Plus')) {
          this.providerCounts['Disney Plus']++;
        }
      });
    }
  }
}
</script>

<style scoped>
.distribution-container {
  background-color: black;
  color: white;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
}

h2 {
  margin-bottom: 20px;
  font-size: 1.2em;
}

.platform-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.platform {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background-color: #222;
  border-radius: 8px;
}

.platform-logo {
  width: 30px;
  height: auto;
}

.count {
  font-size: 1.2em;
  font-weight: bold;
}
</style> 