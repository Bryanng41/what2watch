<template>
  <div class="taste-reel">
    <h2 class="section-title">Because you like {{ tasteProfile.join(', ') }}</h2>

    <div class="scroll-wrapper">
      <button class="scroll-btn left" @click="scrollLeft">◀</button>

      <div class="movie-scroll" ref="scrollContainer">
        <div class="movie-card" v-for="movie in movies" :key="movie.id">
          <img :src="movie.image" :alt="movie.title" class="poster" @click="handleMovieClick(movie)" style="cursor: pointer"/>
          <div class="movie-details">
            <div class="movie-meta">
              <span class="language">{{ movie.language }}</span>
              <span class="genre">{{ movie.genres.join(', ') }}</span>
            </div>
            <h3>{{ movie.title }}</h3>
            <div class="stars">
              <span v-for="(star, i) in getStarRating(movie.rating)" :key="i" :class="star"></span>
              <span class="numeric-rating">{{ movie.rating }}</span>
            </div>
          </div>
          <div class="actions">
            <button class="add-btn" :class="{ active: watchlist.has(movie.id) }"
              @click.stop="handleWatchlistToggle(movie)">
              {{ watchlist.has(movie.id) ? '✓' : '+' }}
            </button>
            <button class="info-btn" @click="handleMovieClick(movie)">More info</button>
          </div>
        </div>
      </div>

      <button class="scroll-btn right" @click="scrollRight">▶</button>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '@/firebase';
import { addToRecents, toggleMovieWatchlist, getUserPreferences } from '@/utils/firebaseActions';
import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import placeholderImg from '@/assets/placeholder.svg';

const scrollContainer = ref(null);
const movies = ref([]);
const genreMap = ref({});
const genreNameToIdMap = ref({})
const tasteProfile = ref([]);
const watchlist = ref(new Set());
const router = useRouter();

const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const baseUrl = import.meta.env.VITE_TMDB_API_URL;

const languageMap = {
  en: 'English', ja: 'Japanese', ko: 'Korean', fr: 'French', de: 'German',
  it: 'Italian', es: 'Spanish', hi: 'Hindi', zh: 'Chinese', pt: 'Portuguese',
  ru: 'Russian', th: 'Thai', vi: 'Vietnamese'
};

const scrollLeft = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      left: -scrollContainer.value.clientWidth * 0.9,
      behavior: 'smooth'
    });
  }
};

const scrollRight = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({
      left: scrollContainer.value.clientWidth * 0.9,
      behavior: 'smooth'
    });
  }
};

const getStarRating = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push('full-star');
    else if (rating >= i - 0.5) stars.push('half-star');
  }
  return stars;
};

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

const updateTasteProfile = async () => {
  const { genres } = await getUserPreferences();
  tasteProfile.value = genres;
};

const loadGenreNameToIdMap = async () => {
  try {
    const res = await axios.get(`${baseUrl}genre/movie/list?api_key=${apiKey}`);
    res.data.genres.forEach(({ id, name }) => {
      genreMap.value[id] = name;
      genreNameToIdMap.value[name] = id;
      genreMap.value[id] = name;
    })
  } catch (error) {
    console.error("Error getting genres:", error);
  }
}

function mapGenreNamesToIds(names) {
  return names
    .map(n => genreNameToIdMap.value[n])
    .filter(id => typeof id === 'number');
}

const fetchRecommendedMovies = async (genreParam) => {
  try {
    const { languages } = await getUserPreferences();
    const allMovies = [];

    // Make separate API calls for each language
    for (let language of languages) {
      const res = await axios.get(`${baseUrl}discover/movie?api_key=${apiKey}&language=${language}&with_genres=${genreParam}&sort_by=vote_average.desc&vote_count.gte=50`);

      const topFifteen = res.data.results.slice(0, 15);

      const moviePromises = topFifteen.map(async movie => {
        const movieData = {
          id:       movie.id,
          title:    movie.title,
          image: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : placeholderImg,
          genres:   movie.genre_ids.map(id => genreMap.value[id] || 'Unknown'),
          language: languageMap[movie.original_language] || movie.original_language,
          rating:   (movie.vote_average / 2).toFixed(1)
        }

        // Check if this movie is in the user's watchlist
        if (await checkWatchlistStatus(movie.id)) {
          watchlist.value.add(movie.id);
        }

        return movieData;
      })

      const batch = await Promise.all(moviePromises);
      // Combine results from each language
      allMovies.push(...batch);
    }

    movies.value = Array.from(
      new Map(allMovies.map(m => [m.id, m])).values()
    );

  } catch (err) {
    console.error('Failed to fetch recommended movies:', err);
  }
};

const handleMovieClick = async (movie) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }
    await addToRecents(movie, user.uid);
    router.push({ path: '/movie', query: { id: movie.id } });
  } catch (err) {
    console.error('Failed to add to recents:', err);
  }
};

const handleWatchlistToggle = async (movie) => {
  const user = auth.currentUser;
  if (!user) {
    alert('Please log in to manage your watchlist.');
    return;
  }

  try {
    console.log(`Toggling watchlist for movie ${movie.id}, current state: ${watchlist.value.has(movie.id)}`);
    const wasAdded = await toggleMovieWatchlist(movie);
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
  console.log("TasteReel component mounted");
  await updateTasteProfile();

  await loadGenreNameToIdMap();
  const genreParam = mapGenreNamesToIds(tasteProfile.value).join('|');

  await fetchRecommendedMovies(genreParam);
});
</script>
  
<style scoped>
.taste-reel {
  margin-top: 40px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
}

.scroll-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.movie-scroll {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 10px 0;
  -ms-overflow-style: none;  /* for Internet Explorer and Edge */
  scrollbar-width: none;     /* for Firefox */
}

.movie-scroll::-webkit-scrollbar {
  display: none;  /* for Chrome, Safari, and newer Edge */
}

.movie-card {
  background-color: #1e1e1e;
  border-radius: 12px;
  width: 200px;
  padding: 15px;
  color: white;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.movie-card:hover {
  transform: translateY(-5px);
}

.poster {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 10px;
}

.movie-details h3 {
  margin: 5px 0;
  font-size: 1rem;
}

.movie-meta {
  font-size: 0.75rem;
  color: #ccc;
  display: flex;
  flex-direction: column;
  margin-bottom: 6px;
}

.stars {
  font-size: 0.9rem;
  color: gold;
  margin: 5px 0;
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
  color: gold;
  clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
  position: relative;
}

.numeric-rating {
  font-size: 0.8rem;
  color: white;
  margin-left: 4px;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.add-btn {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 1.2rem;
  cursor: pointer;
}

.info-btn {
  background-color: #29d863;
  color: black;
  font-weight: 600;
  border: none;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}

.scroll-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  z-index: 10;
  padding: 10px;
}

.left {
  margin-right: 5px;
}

.right {
  margin-left: 5px;
}

.add-btn.active {
  background-color: rgba(0, 255, 0, 0.25);
  color: black;
  font-weight: bold;
}
</style>