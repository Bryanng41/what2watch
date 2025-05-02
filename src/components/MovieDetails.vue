<template>
  <div class="movie-details-container" :style="backgroundStyle">
    <div class="overlay"></div>
    <button class="back-button" @click="$router.back()">← Back</button>

    <div v-if="movie" class="movie-details-card">
      <img
        :src="getPoster(movie.poster_path)"
        :alt="movie.title"
        class="poster"
      />

      <div class="info">
        <h1>{{ movie.title }}</h1>
        <div class="meta">
          <div class="rating">
            <span>Ratings:</span>
            <span
              v-for="(star, index) in getStarRating(movie.vote_average / 2)"
              :key="index"
              :class="star"
            ></span>
            <span class="numeric-rating">{{ (movie.vote_average / 2).toFixed(1) }}</span>
          </div>
          <span>Duration: {{ computeDuration(movie.runtime) }}</span>
          <span v-if="movie.genres && movie.genres.length">
            Genres: {{ movie.genres.map((g) => g.name).join(", ") }}
          </span>
        </div>

        <p class="overview">{{ movie.overview }}</p>

        <div v-if="movie.providers && movie.providers.length > 0" class="streaming-providers">
          <span>Available on:</span>
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
        </div>

        <button 
          class="watchlist-button" 
          :class="{ 'in-watchlist': isInWatchlist }"
          @click="toggleWatchlist"
        >
          <span>{{ isInWatchlist ? '✓' : '+' }}</span>
          {{ isInWatchlist ? 'In Watchlist' : 'Add to Watchlist' }}
        </button>

      </div>
    </div>

    <div v-else class="loading">Loading movie...</div>
  </div>
</template>

<script>
import axios from "axios";
import placeholder from "@/assets/placeholder.svg";
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from '../firebase.js';
import { onAuthStateChanged } from "firebase/auth";
import { addToRecents, toggleMovieWatchlist } from '@/utils/firebaseActions';

export default {
  data() {
    return {
      movie: null,
      API_URL: import.meta.env.VITE_TMDB_API_URL,
      API_KEY: import.meta.env.VITE_TMDB_API_KEY,
      userId: null,
      isInWatchlist: false
    };
  },
  computed: {
    backgroundStyle() {
      if (this.movie && this.movie.backdrop_path) {
        return {
          backgroundImage: `url(https://image.tmdb.org/t/p/original${this.movie.backdrop_path})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      }
      return {};
    },
    computeDuration() {
      return (mins) => {
        if (!mins) return "N/A";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m ? `${h}h ${m}m` : `${h}h`;
      };
    },
  },
  methods: {
    async apiQuery() {
      try {
        console.log(this.$route.query.id);
        const response = await axios.get(
          `${this.API_URL}movie/${this.$route.query.id}?language=en-US&api_key=${this.API_KEY}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: this.API_KEY,
            },
          }
        );
        this.movie = response.data;
        console.log(this.movie);
        
        // Fetch streaming providers
        const providersResponse = await axios.get(
          `${this.API_URL}movie/${this.$route.query.id}/watch/providers?api_key=${this.API_KEY}`
        );
        
        // Get Singapore providers
        const sgProviders = providersResponse.data.results.SG;
        this.movie.providers = [];
        
        if (sgProviders && sgProviders.flatrate) {
          this.movie.providers = sgProviders.flatrate.map(provider => {
            // Standardize provider names
            if (provider.provider_name === 'Disney Plus') return 'Disney Plus';
            if (provider.provider_name === 'Amazon Prime Video') return 'Amazon';
            return provider.provider_name;
          });
        }
        
        // Add to recents when movie is loaded
        if (this.userId) {
          await this.addToRecents();
          await this.checkWatchlistStatus();
        }
      } catch (error) {
        console.error("API Error:", error);
      }
    },
    getPoster(path) {
      return path ? `https://image.tmdb.org/t/p/original${path}` : placeholder;
    },
    getCurrentUser() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.userId = user.uid;
          console.log("Current user ID:", this.userId);
          // Add to recents if movie is already loaded
          if (this.movie) {
            this.addToRecents();
          }
        } else {
          console.log("No user is signed in");
          this.userId = null;
        }
      });
    },
    async addToRecents() {
      if (!this.userId || !this.movie) return;
      
      try {
        const movieData = {
          title: this.movie.title,
          genres: this.movie.genres.map(genre => genre.name),
          id: this.movie.id,
          image: `https://image.tmdb.org/t/p/w500${this.movie.poster_path}`,
          language: this.movie.original_language,
          rating: (this.movie.vote_average / 2).toFixed(1)
        };
        
        await addToRecents(movieData, this.userId);
        console.log("Movie added to recents successfully");
      } catch (error) {
        console.error("Error adding movie to recents:", error);
      }
    },
    async checkWatchlistStatus() {
      if (!this.userId || !this.movie) return;
      
      try {
        const watchlistDoc = doc(db, "Users", this.userId, "Watchlist", this.movie.id.toString());
        const docSnap = await getDoc(watchlistDoc);
        this.isInWatchlist = docSnap.exists();
      } catch (error) {
        console.error("Error checking watchlist status:", error);
      }
    },
    async toggleWatchlist() {
      if (!this.userId || !this.movie) return;
      
      try {
        const movieData = {
          title: this.movie.title,
          genres: this.movie.genres.map(genre => genre.name),
          id: this.movie.id,
          image: `https://image.tmdb.org/t/p/w500${this.movie.poster_path}`,
          language: this.movie.original_language,
          rating: (this.movie.vote_average / 2).toFixed(1)
        };
        
        const wasAdded = await toggleMovieWatchlist(movieData);
        this.isInWatchlist = wasAdded;
        console.log(wasAdded ? "Movie added to watchlist successfully" : "Movie removed from watchlist successfully");
      } catch (error) {
        console.error("Error toggling watchlist:", error);
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
  },
  mounted() {
    this.getCurrentUser();
    this.apiQuery();
  },
};
</script>

<style scoped>
.watchlist-button {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: 500;
  backdrop-filter: blur(4px);
  width: fit-content;
  font-size: 16px;
  transition: background-color 0.2s;
}

.watchlist-button:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.watchlist-button.in-watchlist {
  background-color: rgba(0, 255, 0, 0.2);
}

.watchlist-button.in-watchlist:hover {
  background-color: rgba(0, 255, 0, 0.3);
}

.watchlist-button span {
  font-size: 1.4rem;
  margin-right: 8px;
}

.movie-details-container {
  padding: 20px;
  color: white;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1;
}

.back-button {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
  align-self: flex-start;
}

.movie-details-card {
  display: flex;
  flex-direction: row;
  gap: 30px;
  background: rgba(34, 34, 34, 0.7);
  padding: 30px;
  border-radius: 15px;
  position: relative;
  z-index: 2;
  backdrop-filter: blur(4px);
  margin: 0 auto;
  max-width: 1200px;
  width: 100%;
}

.poster {
  width: 300px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info h1 {
  font-size: 2.5rem;
  margin: 0;
  line-height: 1.2;
}

.meta {
  display: flex;
  flex-direction: column;
  color: #ccc;
  font-size: 16px;
  gap: 8px;
}

.overview {
  line-height: 1.6;
  color: #ddd;
  font-size: 16px;
  margin: 0;
}

.streaming-providers {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
  color: white;
}

.provider-logo {
  width: 50px;
  height: auto;
  margin-left: 5px;
  transition: transform 0.2s;
}

.provider-logo:hover {
  transform: scale(1.1);
}

.providers {
  margin-top: 20px;
}

.providers h3 {
  margin-bottom: 10px;
  color: white;
}

.providers .logos img {
  width: 50px;
  margin-right: 10px;
}

.loading {
  position: relative;
  z-index: 2;
  text-align: center;
  font-size: 18px;
  margin-top: 50px;
  width: 100%;
}

.watchlist-button:disabled {
  background-color: rgba(0, 255, 0, 0.2);
  cursor: default;
}

.watchlist-button:disabled:hover {
  background-color: rgba(0, 255, 0, 0.2);
}

.rating {
  color: yellow;
  display: flex;
  align-items: center;
  gap: 5px;
}

.rating span:first-child {
  color: #ccc;
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

.numeric-rating {
  margin-left: 5px;
  color: white;
}
</style>
