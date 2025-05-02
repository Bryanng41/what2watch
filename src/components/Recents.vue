<template>
  <div class="recents-container">
    <div class="recents-header">
      <h2>Recents</h2>
    </div>
  
    <div class="movies-list">
      <div v-if="movies.length === 0" class="empty-state">
        No movies in your recents
      </div>
      <div v-else v-for="movie in paginatedMovies" :key="movie.id" class="movie-card">
        <img :src="movie.image" :alt="movie.title" class="movie-poster" @click="$router.push(`/movie?id=${movie.id}`)" />
        <div class="movie-info">
          <div class="movie-details">
            <h3 @click="$router.push(`/movie?id=${movie.id}`)">{{ movie.title }}</h3>
            <p>Genres: {{ movie.genres.join(', ') }}</p>
          </div>
          <div class="rating">
            <span v-for="(star, index) in getStarRating(movie.rating)" :key="index" :class="star"></span>
            <span class="numeric-rating">{{ movie.rating }}</span>
            <div class="available-on">
              <template v-if="movie.providers.length >= 1">
                Available on:
                <img v-if="movie.providers.includes('Amazon')" src="https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg" alt="Amazon Prime Video" class="provider-logo">
                <img v-if="movie.providers.includes('Netflix')" src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" class="provider-logo">
                <img v-if="movie.providers.includes('Disney Plus')" src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" alt="Disney+" class="provider-logo">
              </template>
              <template v-else>
                <div style="height: 30px;"></div>
              </template>
            </div>
          </div>
        </div>
        <div class="options-container">
          <button class="options-button" @click="toggleOptions(movie.id)">⋮</button>
          <div v-if="showOptions === movie.id" class="options-dropdown">
            <div class="option-item" @click="deleteMovie(movie.id)">Delete</div>
          </div>
        </div>
      </div>
    </div>
  
    <div class="pagination" v-if="movies.length > 0">
      <a v-if="currentPage > 1" @click="prevPage">◀ Prev</a>
      <span>Page {{ currentPage }} of {{ Math.max(1, totalPages) }}</span>
      <a v-if="currentPage < totalPages" @click="nextPage">Next ▶</a>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from '../firebase.js';
import { onAuthStateChanged } from "firebase/auth";

export default {
  data() {
    return {
      movies: [],
      currentPage: 1,
      moviesPerPage: 5,
      userId: null,
      showOptions: null
    };
  },
  watch: {
    movies: {
      handler(newMovies) {
        this.$emit('movies-updated', newMovies);
      },
      deep: true
    }
  },
  mounted() {
    // Get current user ID
    this.getCurrentUser();
    // Add event listener for clicking outside the options dropdown
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    // Remove event listener when component is unmounted
    document.removeEventListener('click', this.handleClickOutside);
  },
  computed: {
    totalPages() {
      return Math.ceil(this.movies.length / this.moviesPerPage);
    },
    paginatedMovies() {
      const start = (this.currentPage - 1) * this.moviesPerPage;
      return this.movies.slice(start, start + this.moviesPerPage);
    }
  },
  methods: {
    getCurrentUser() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.userId = user.uid;
          console.log("Current user ID for Recents:", this.userId);
          this.fetchMovies();
        } else {
          console.log("No user is signed in for Recents");
          this.userId = null;
          this.movies = [];
        }
      });
    },
    async fetchMovies() {
      if (!this.userId) {
        console.log("No user ID available, cannot fetch movies");
        return;
      }
      
      try {
        console.log("Fetching movies from Firestore for user:", this.userId);
        const moviesCollection = query(collection(db, "Users", this.userId, "Recents"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(moviesCollection);
        console.log(`Found ${snapshot.docs.length} movies in recents`);
        
        this.movies = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          genres: doc.data().genres,
          image: doc.data().image,
          language: doc.data().language,
          rating: doc.data().rating,
          timestamp: doc.data().timestamp,
          providers: doc.data().providers || []
        }));
        
        console.log("Movies loaded successfully:", this.movies.length);
      } catch (error) {
        console.error("Error fetching movies:", error);
        this.movies = [];
      }
    },
    formatDuration(minutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    getStarRating(rating) {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
          stars.push('full-star');
        } else if (rating >= i - 0.5) {
          stars.push('half-star');
        } 
      }
      return stars;
    },
    handleClickOutside(event) {
      const optionsContainers = this.$el.querySelectorAll('.options-container');
      let isInsideOptions = false;
      optionsContainers.forEach(container => {
        if (container.contains(event.target)) {
          isInsideOptions = true;
        }
      });
      
      if (!isInsideOptions) {
        this.showOptions = null;
      }
    },
    toggleOptions(movieId) {
      this.showOptions = this.showOptions === movieId ? null : movieId;
    },
    async deleteMovie(movieId) {
      if (!this.userId) return;
      
      try {
        const movieDoc = doc(db, "Users", this.userId, "Recents", movieId.toString());
        await deleteDoc(movieDoc);
        console.log("Movie deleted from recents successfully");
        
        // Remove the movie from the local array
        this.movies = this.movies.filter(movie => movie.id !== movieId);
        this.showOptions = null; // Close the dropdown
      } catch (error) {
        console.error("Error deleting movie from recents:", error);
      }
    }
  }
};
</script>

<style scoped>
.recents-container {
  width: 80%;
  background-color: black;
  color: white;
  padding: 20px 40px 20px 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}

.recents-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.movies-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  position: relative;
}

.movie-card {
  display: flex;
  align-items: center;
  background-color: #222;
  padding: 10px;
  border-radius: 10px;
  position: relative;
  width: 100%;
}

.movie-poster {
  width: 80px;
  border-radius: 5px;
  margin-right: 10px;
  cursor: pointer;
}

.movie-details {
  flex-grow: 1;
}

.rating {
  color: yellow;
}

.options-container {
  position: absolute;
  right: 10px;
}

.options-button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
}

.options-button:hover {
  background-color: #444;
}

.options-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: #333;
  border-radius: 5px;
  padding: 5px 0;
  min-width: 100px;
  z-index: 1000;
}

.option-item {
  padding: 8px 15px;
  color: white;
  cursor: pointer;
}

.option-item:hover {
  background-color: #444;
}

.option-item:active {
  background-color: #555;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 15px;
  gap: 10px;
  align-items: center;
}

.pagination span {
  color: white;
}

.pagination a {
  color: white;
  text-decoration: none;
  cursor: pointer;
}

.pagination a:hover {
  text-decoration: underline;
}

.pagination a:disabled {
  color: #666;
  cursor: default;
  text-decoration: none;
}

.provider-logo {
  width: 30px;
  height: auto;
  margin-left: 5px;
}

.available-on {
  display: flex;
  align-items: center;
  margin-top: 10px;
  color: white;
}

.full-star::after {
  content: '⭐';
  color: gold;
}

.half-star::after {
  content: '⭐';
  position: relative;
  color: gold;
  clip-path: polygon(0 0, 50% 0, 50% 100%, 0% 100%);
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #888;
  font-size: 1.2em;
}

.movie-details h3 {
  cursor: pointer;
}

.movie-details h3:hover {
  text-decoration: underline;
}
</style> 