<template>
  <div class="popular-carousel">
    <div v-if="error" class="error-message">
      {{ error }}
      <p>Please check your TMDB API key configuration in the .env file.</p>
    </div>
    <Swiper v-else :modules="[Navigation, Pagination, Autoplay]" :slides-per-view="1" :loop="true"
      :pagination="{ clickable: true }" :navigation="true" :autoplay="{ delay: 4000 }" class="mySwiper">
      <SwiperSlide v-for="(movie, index) in movies" :key="index">
        <div class="slide" @click="handleMovieClick(movie)">
          <img :src="movie.image" :alt="movie.title" class="clickable-cover" />
          <!-- Move available-on to top right -->
          <div class="available-on" v-if="movie.providers.length">
            Available on:
            <img v-if="movie.providers.includes('Netflix')"
              src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix"
              class="provider-logo" />
            <img v-if="movie.providers.includes('Amazon Prime Video')"
              src="https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg" alt="Amazon Prime"
              class="provider-logo" />
            <img v-if="movie.providers.includes('Disney Plus') || movie.providers.includes('Disney+')"
              src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" alt="Disney+"
              class="provider-logo" />
          </div>

          <!-- Existing overlay remains -->
          <div class="overlay">
            <div class="left">
              <h2>{{ movie.title }}</h2>
              <p class="meta">{{ movie.language }} | {{ movie.genres.join(', ') }}</p>
              <div class="rating">
                <template v-if="parseFloat(movie.rating) > 0">
                  <span v-for="(star, i) in getStarRating(movie.rating)" :key="i" :class="star"></span>
                  <span class="numeric-rating">{{ movie.rating }}</span>
                </template>
                <template v-else>
                  <span class="no-rating">No rating available</span>
                </template>
              </div>
            </div>
            <button class="watchlist-button" :class="{ active: watchlist.has(movie.id) }"
              @click.stop="handleWatchlistToggle(movie)">
              <span>{{ watchlist.has(movie.id) ? '✓' : '+' }}</span>
              {{ watchlist.has(movie.id) ? 'In Watchlist' : 'Watchlist' }}
            </button>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '@/firebase';
import { addToRecents, toggleMovieWatchlist } from '@/utils/firebaseActions';
import { Swiper, SwiperSlide } from 'swiper/vue';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

SwiperCore.use([Navigation, Pagination, Autoplay]);

const movies = ref([]);
const genreMap = ref({});
const error = ref(null);
const watchlist = ref(new Set());
const router = useRouter();

const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const baseUrl = import.meta.env.VITE_TMDB_API_URL;

const languageMap = {
  en: 'English',
  ja: 'Japanese',
  ko: 'Korean',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  es: 'Spanish',
  hi: 'Hindi',
  zh: 'Chinese',
  pt: 'Portuguese',
  ru: 'Russian',
  th: 'Thai',
  vi: 'Vietnamese',
  // Add more as needed
};

const fetchGenres = async (apiKey) => {
  try {
    if (!apiKey) {
      throw new Error('TMDB API key is not configured');
    }
    const res = await fetch(`${baseUrl}genre/movie/list?api_key=${apiKey}&language=en-US`);
    if (!res.ok) {
      throw new Error(`Failed to fetch genres: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.genres) {
      data.genres.forEach((genre) => {
        genreMap.value[genre.id] = genre.name;
      });
    } else {
      throw new Error('Invalid genre data received');
    }
  } catch (err) {
    console.error('Error fetching genres:', err);
    error.value = err.message;
    throw err;
  }
};

// Add a function to check if a movie is in the user's watchlist
const checkWatchlistStatus = async (movieId) => {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const watchlistDoc = doc(db, "Users", user.uid, "Watchlist", movieId.toString());
    const docSnap = await getDoc(watchlistDoc);
    return docSnap.exists();
  } catch (error) {
    console.error(`Error checking watchlist status for movie ${movieId}:`, error);
    return false;
  }
};

const fetchMovies = async () => {
  try {
    if (!apiKey) {
      throw new Error('TMDB API key is not configured. Please check your .env file.');
    }

    await fetchGenres(apiKey);

    const response = await fetch(
      `${baseUrl}movie/popular?api_key=${apiKey}&language=en-US&page=1`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch movies: ${response.statusText}`);
    }
    const data = await response.json();

    const moviePromises = data.results.map(async (movie) => {
      try {
        const providerRes = await fetch(
          `${baseUrl}movie/${movie.id}/watch/providers?api_key=${apiKey}`
        );
        if (!providerRes.ok) {
          console.warn(`Failed to fetch providers for movie ${movie.id}`);
          return null;
        }
        const providerData = await providerRes.json();
        const platforms = providerData.results?.SG?.flatrate?.map(p => p.provider_name) || [];

        // Check if this movie is in the user's watchlist
        const isInWatchlist = await checkWatchlistStatus(movie.id);
        if (isInWatchlist) {
          watchlist.value.add(movie.id);
        }

        return {
          id: movie.id,
          title: movie.title,
          // Use backdrop for display
          image: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`,
          // Store poster path separately for Firebase
          poster_path: movie.poster_path,
          rating: (movie.vote_average / 2).toFixed(1),
          releaseDate: movie.release_date,
          genres: movie.genre_ids.map(id => genreMap.value[id] || 'Unknown'),
          language: languageMap[movie.original_language] || movie.original_language,
          providers: platforms
        };
      } catch (err) {
        console.warn(`Error processing movie ${movie.id}:`, err);
        return null;
      }
    });

    const results = await Promise.all(moviePromises);
    movies.value = results.filter(movie => movie !== null);
    movies.value.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    console.log("Popular movies loaded with watchlist status:", movies.value.map(m => ({ id: m.id, inWatchlist: watchlist.value.has(m.id) })));
  } catch (error) {
    console.error('Failed to fetch movies:', error);
    error.value = error.message;
  }
};

const getStarRating = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push('full-star');
    } else if (rating >= i - 0.5) {
      stars.push('half-star');
    }
  }
  return stars;
};

const handleMovieClick = async (movie) => {
  try {
    await addToRecents(movie)
    router.push({ path: '/movie', query: { id: movie.id } })
  } catch (err) {
    console.error('Failed to add to recents:', err)
  }
}

const handleWatchlistToggle = async (movie) => {
  const user = auth.currentUser;
  if (!user) {
    alert('Please log in to manage your watchlist.');
    return;
  }

  try {
    console.log(`Toggling watchlist for movie ${movie.id}, current state: ${watchlist.value.has(movie.id)}`);
    
    // Create a copy of the movie object with the poster image for Firebase
    const movieForFirebase = {
      ...movie,
      image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    };
    
    const wasAdded = await toggleMovieWatchlist(movieForFirebase);
    console.log(`Toggle result: ${wasAdded ? 'added' : 'removed'}`);
    
    if (wasAdded) {
      watchlist.value.add(movie.id);
    } else {
      watchlist.value.delete(movie.id);
    }
    
    // Force a reactive update
    watchlist.value = new Set(watchlist.value);
  } catch (error) {
    console.error('Error toggling watchlist:', error);
  }
};

onMounted(async () => {
  console.log("PopularCarousel component mounted");
  await fetchMovies();
});
</script>

<style scoped>
.popular-carousel {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.mySwiper {
  width: 100%;
}

.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.left h2 {
  font-size: 3rem;
  margin: 0;
  line-height: 1.2;
}

.watchlist-button {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.watchlist-button span {
  font-size: 1.2rem;
  margin-right: 6px;
}

.watchlist-button.active {
  background-color: rgba(0, 255, 0, 0.25);
  color: black;
  font-weight: bold;
}

/* ⭐ STAR STYLING */
.rating {
  color: yellow;
  display: flex;
  align-items: center;
  gap: 5px;
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

.numeric-rating {
  color: white;
  font-size: 0.9rem;
  margin-left: 4px;
}

.no-rating {
  color: #bbb;
  font-size: 0.9rem;
  font-style: italic;
}

.available-on {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: white;
  z-index: 2;
}

.provider-logo {
  height: 30px;
  width: auto;
  border-radius: 4px;
}

.slide {
  position: relative;
  width: 100%;
  aspect-ratio: 15 / 5;
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.clickable-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  cursor: pointer;
}

.meta {
  font-size: 1rem;
  font-weight: 500;
  color: #ddd;
  margin-top: 6px;
}

.error-message {
  background-color: #ff4444;
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin: 20px;
}

.error-message p {
  margin-top: 10px;
  font-size: 0.9em;
  opacity: 0.8;
}
</style>