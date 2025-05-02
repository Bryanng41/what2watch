<template>
  <div v-if="results.length" class="movie-container">
    <div class="search-header">
      <h2>Search Results for: "{{ $route.query.q }}"</h2>
      <div class="filter-section">
        <div class="filter-group">
          <label>Year Range:</label>
          <div class="year-inputs">
            <input 
              type="number" 
              v-model="yearFrom" 
              placeholder="From" 
              min="1900" 
              max="2024"
              @input="applyFilters"
            />
            <span>to</span>
            <input 
              type="number" 
              v-model="yearTo" 
              placeholder="To" 
              min="1900" 
              max="2024"
              @input="applyFilters"
            />
          </div>
        </div>
        <div class="filter-group">
          <label>Genre:</label>
          <select v-model="selectedGenre" @change="applyFilters">
            <option value="">All Genres</option>
            <option v-for="genre in genres" :key="genre.id" :value="genre.id">{{ genre.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Rating:</label>
          <select v-model="selectedRating" @change="applyFilters">
            <option value="">All Ratings</option>
            <option v-for="rating in ratingRanges" :key="rating" :value="rating">{{ rating }}+</option>
          </select>
        </div>
      </div>
    </div>
    <div
      v-for="(item, index) in filteredResults"
      :key="index"
      class="movie"
      @click="showDetails(item.id)"
    >
      <img
        v-if="item.poster_path"
        class="movie-poster"
        :src="`https://image.tmdb.org/t/p/original${item.poster_path}`"
        :alt="item.title"
      />
      <img v-else class="movie-placeholder" :src="placeholder" />
      <h3 class="movie-text">{{ item.title }}</h3>
    </div>
    <div class="pagination">
      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="prevPage"
      >
        ◀ Prev
      </button>

      <span class="pagination-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>

      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        Next ▶
      </button>
    </div>
  </div>
  <div v-else class="movie-container">
    <div class="search-header">
      <h2>Search Results for: "{{ $route.query.q }}"</h2>
    </div>
    <p class="movie-text">No Movies Found</p>
  </div>
</template>

<script>
import axios from "axios";
import placeholder from "@/assets/placeholder.svg";

export default {
  data() {
    return {
      results: [],
      filteredResults: [],
      placeholder: placeholder,
      currentPage: 1,
      totalPages: 0,
      API_URL: import.meta.env.VITE_TMDB_API_URL,
      API_KEY: import.meta.env.VITE_TMDB_API_KEY,
      yearFrom: '',
      yearTo: '',
      selectedGenre: '',
      selectedRating: '',
      ratingRanges: [4, 3, 2, 1, 0],
      genres: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 14, name: 'Fantasy' },
        { id: 36, name: 'History' },
        { id: 27, name: 'Horror' },
        { id: 10402, name: 'Music' },
        { id: 9648, name: 'Mystery' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Science Fiction' },
        { id: 10770, name: 'TV Movie' },
        { id: 53, name: 'Thriller' },
        { id: 10752, name: 'War' },
        { id: 37, name: 'Western' }
      ]
    };
  },
  methods: {
    async apiQuery() {
      try {
        const response = await axios.get(
          `${this.API_URL}search/movie?query=${this.$route.query.q}&include_adult=false&language=en-US&page=${this.currentPage}&api_key=${this.API_KEY}`
        );
        console.log(response.data.results);
        this.results = response.data.results;
        this.totalPages = response.data.total_pages;
        this.results = this.results.sort(function (a, b) {
          return new Date(b.release_date) - new Date(a.release_date);
        });
        console.log(this.totalPages);
        this.applyFilters();
      } catch (error) {
        console.error("API Error:", error);
      }
    },
    applyFilters() {
      this.filteredResults = this.results.filter(movie => {
        // Year filter
        if (this.yearFrom && this.yearTo) {
          const movieYear = new Date(movie.release_date).getFullYear();
          if (movieYear < this.yearFrom || movieYear > this.yearTo) return false;
        }

        // Genre filter
        if (this.selectedGenre && movie.genre_ids) {
          if (!movie.genre_ids.includes(Number(this.selectedGenre))) return false;
        }

        // Rating filter (convert from 10-point scale to 5-point scale)
        if (this.selectedRating !== '') {
          const movieRating = movie.vote_average / 2; // Convert from 10-point to 5-point scale
          if (movieRating < Number(this.selectedRating)) return false;
        }

        return true;
      });
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
      }
    },
    showDetails(index) {
      this.$router.push({ path: "/movie", query: { id: index } });
    }
  },
  watch: {
    "$route.query.q"(newQuery, oldQuery) {
      if (newQuery !== oldQuery) {
        this.currentPage = 1;
        this.totalPages = 0;
        this.apiQuery();
      }
    },
    currentPage(prevPageNum, nextPageNum) {
      if (prevPageNum !== nextPageNum) {
        this.apiQuery();
      }
    },
  },
  mounted() {
    this.apiQuery();
  },
};
</script>

<style scoped>
body {
  background-color: #222;
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 20px;
}

.movie-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  padding: 20px;
  background-color: black;
}

.movie {
  background: #1e1e1e;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  padding: 16px;
  width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s ease;
}

.movie:hover {
  transform: translateY(-5px);
}

.movie-poster {
  width: 100%;
  height: 330px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(255, 255, 255, 0.2);
}

.movie-placeholder {
  width: 100%;
  height: 330px;
  border-radius: 10px;
}

.movie-text {
  width: 200px;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.pagination {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  font-size: 16px;
  width: 100%;
}

.pagination-info {
  color: white;
  text-align: center;
}

.pagination-btn {
  background-color: #444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 80px;
  text-align: center;
}

.pagination-btn:hover {
  background-color: #666;
}

.pagination-btn:disabled {
  background-color: #222;
  color: #888;
  cursor: not-allowed;
}

.search-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: white;
}

.search-header h2 {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
}

.filter-section {
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-size: 14px;
  color: #ccc;
}

.filter-group select {
  background-color: #333;
  color: white;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 14px;
  cursor: pointer;
  min-width: 150px;
}

.filter-group select:hover {
  background-color: #444;
}

.filter-group select:focus {
  outline: none;
  border-color: #00DE64;
}

.year-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.year-inputs input {
  width: 80px;
  background-color: #333;
  color: white;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 14px;
}

.year-inputs input:focus {
  outline: none;
  border-color: #00DE64;
}

.year-inputs span {
  color: #ccc;
}
</style>
