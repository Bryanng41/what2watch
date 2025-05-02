<template>
  <div class="watchlist-container">
    <div class="watchlist-header">
      <h2>Watchlist</h2>
      <div class="sort-container">
        <button class="sort-button" @click="toggleSortDropdown">
          Sort By: {{ currentSort }}
        </button>
        <button class="direction-button" @click="toggleSortDirection">
          {{ sortOrder === "asc" ? "↑" : "↓" }}
        </button>
        <div v-if="showSortDropdown" class="sort-dropdown">
          <div
            v-for="option in sortOptions"
            :key="option.value"
            class="sort-option"
            @click="selectSort(option.value)"
          >
            {{ option.label }}
          </div>
        </div>
      </div>
    </div>

    <div class="movies-list">
      <div v-if="movies.length === 0" class="empty-state">
        Watchlist is empty
      </div>
      <div
        v-else
        v-for="movie in paginatedMovies"
        :key="movie.id"
        class="movie-card"
      >
        <img 
          :src="movie.image" 
          :alt="movie.title" 
          class="movie-poster"
          @click="$router.push(`/movie?id=${movie.id}`)"
        />
        <div class="movie-info">
          <div class="movie-details">
            <h3 @click="$router.push(`/movie?id=${movie.id}`)">{{ movie.title }}</h3>
            <p>Genres: {{ movie.genres.join(', ') }}</p>
          </div>
          <div class="rating">
            <span
              v-for="(star, index) in getStarRating(movie.rating)"
              :key="index"
              :class="star"
            ></span>
            <span class="numeric-rating">{{ movie.rating }}</span>
            <div class="available-on">
              <template v-if="movie.providers.length >= 1">
                Available on:
                <img
                  v-if="movie.providers.includes('Amazon')"
                  src="https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg"
                  alt="Amazon Prime Video"
                  class="provider-logo"
                />
                <img
                  v-if="movie.providers.includes('Netflix')"
                  src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
                  alt="Netflix"
                  class="provider-logo"
                />
                <img
                  v-if="movie.providers.includes('Disney Plus')"
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg"
                  alt="Disney+"
                  class="provider-logo"
                />
              </template>
              <template v-else>
                <div style="height: 30px"></div>
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
        currentSort: 'Time', // Default sort field
        sortOptions: [
          { label: 'Time', value: 'time' },
          { label: 'Title', value: 'title' },
          { label: 'Rating', value: 'rating' }
        ],
        showSortDropdown: false,
        sortOrder: 'desc',
        userId: null,
        showOptions: null // Track which movie's options are shown
      };
    },
    mounted() {
      // Get current user ID
      this.getCurrentUser();
      // Add event listener for clicking outside the sort dropdown
      document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
      // Remove event listener when component is unmounted
      document.removeEventListener('click', this.handleClickOutside);
    },
    computed: {
      paginatedMovies() {
        const start = (this.currentPage - 1) * this.moviesPerPage;
        return this.movies.slice(start, start + this.moviesPerPage);
      },
      totalPages() {
        return Math.ceil(this.movies.length / this.moviesPerPage);
      }
    },
    methods: {
      getCurrentUser() {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            this.userId = user.uid;
            console.log("Current user ID:", this.userId);
            this.fetchMovies();
          } else {
            console.log("No user is signed in");
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
          const moviesCollection = query(collection(db, "Users", this.userId, "Watchlist"), orderBy("timestamp", "desc"));
          const snapshot = await getDocs(moviesCollection);
          console.log(`Found ${snapshot.docs.length} movies in watchlist`);
          
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
      toggleSortDropdown() {
        this.showSortDropdown = !this.showSortDropdown;
      },
      handleClickOutside(event) {
        const sortContainer = this.$el.querySelector('.sort-container');
        if (sortContainer && !sortContainer.contains(event.target)) {
          this.showSortDropdown = false;
        }
        
        // Check if click is outside any options container
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
      toggleSortDirection() {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        this.sortMovies(this.getCurrentSortValue(), this.sortOrder);
      },
      getCurrentSortValue() {
        return this.sortOptions.find(opt => opt.label === this.currentSort).value;
      },
      selectSort(sortBy) {
        const selectedOption = this.sortOptions.find(opt => opt.value === sortBy);
        this.currentSort = selectedOption.label;
        this.sortMovies(sortBy, this.sortOrder);
        this.showSortDropdown = false;
      },
      sortMovies(sortBy, order) {
        this.movies.sort((a, b) => {
          let comparison = 0;
          switch (sortBy) {
            case 'rating':
              comparison = parseFloat(a.rating) - parseFloat(b.rating);
              break;
            case 'time':
              // Sort by timestamp (newest first by default)
              comparison = b.timestamp - a.timestamp;
              break;
            case 'title':
              // Case-insensitive title comparison
              comparison = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
              break;
          }
          return order === 'asc' ? comparison : -comparison;
        });
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
      toggleOptions(movieId) {
        this.showOptions = this.showOptions === movieId ? null : movieId;
      },
      async deleteMovie(movieId) {
        if (!this.userId) return;
        
        try {
          const movieDoc = doc(db, "Users", this.userId, "Watchlist", movieId.toString());
          await deleteDoc(movieDoc);
          console.log("Movie deleted successfully");
          
          // Remove the movie from the local array
          this.movies = this.movies.filter(movie => movie.id !== movieId);
          this.showOptions = null; // Close the dropdown
        } catch (error) {
          console.error("Error deleting movie:", error);
        }
      }
    },
    watch: {
      movies: {
        handler(newMovies) {
          console.log("Movies updated in WatchlisDisplay, emitting update:", newMovies.length);
          this.$emit('movies-updated', newMovies);
        },
        deep: true,
        immediate: true
      }
    }
  };
</script>

<style scoped>
.watchlist-container {
  width: 80%;
  background-color: black;
  color: white;
  padding: 20px 40px 20px 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}

.watchlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.sort-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
}

.sort-button {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  width: 150px; /* Fixed width to accommodate longest option */
  justify-content: flex-start;
  font-family: 'Times New Roman', Times, serif;
}

.direction-button {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  flex-shrink: 0; /* Prevent button from shrinking */
}

.direction-button:hover {
  background-color: #444;
}

.sort-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #333;
  border-radius: 5px;
  padding: 5px 0;
  min-width: 150px;
  z-index: 1000;
}

.sort-option {
  padding: 8px 15px;
  color: white;
  cursor: pointer;
}

.sort-option:hover {
  background-color: #444;
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

.movie-details h3 {
  cursor: pointer;
}

.movie-details h3:hover {
  text-decoration: underline;
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
  width: 30px; /* Adjust size as needed */
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
  content: "⭐";
  color: gold;
}

.half-star::after {
  content: "⭐";
  position: relative;
  color: gold;
  clip-path: polygon(0 0, 50% 0, 50% 100%, 0% 100%); /* Clips half the star */
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
</style>
