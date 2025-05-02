import { query, orderBy, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase';
import axios from 'axios';

const auth = getAuth();

const apiKey = import.meta.env.VITE_TMDB_API_KEY;
const baseUrl = import.meta.env.VITE_TMDB_API_URL;

// Save onboarding profile
export const saveUserOnboardingProfile = async (data) => {
    const user = auth.currentUser
    if (!user) throw new Error('User not authenticated')
  
    const userRef = doc(db, 'Users', user.uid)
    const profileData = {
      ...data,
      email: user.email,
      createdAt: new Date().toISOString(),
      username: user.displayName ?? '', // Add this line if displayName was set
    }
  
    await setDoc(userRef, profileData, { merge: true })
  }

// Update user profile with merge (preserve existing fields)
export const updateUserProfile = async (profileData) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const userRef = doc(db, 'Users', user.uid);
    await setDoc(userRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
    }, { merge: true });
};

// Get user profile data
export const getUserProfile = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const userRef = doc(db, 'Users', user.uid);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? docSnap.data() : null;
};

export const fetchMovieProviders = async (movieId) => {
  try {
    const providersResponse = await axios.get(
      `${baseUrl}movie/${movieId}/watch/providers?api_key=${apiKey}`
    );
    
    // Get Singapore providers
    const sgProviders = providersResponse.data.results.SG;
    let providers = [];
    
    if (sgProviders && sgProviders.flatrate) {
      providers = sgProviders.flatrate.map(provider => {
        // Standardize provider names
        if (provider.provider_name === 'Disney Plus') return 'Disney Plus';
        if (provider.provider_name === 'Amazon Prime Video') return 'Amazon';
        if (provider.provider_name === 'Netflix') return 'Netflix';
        return provider.provider_name;
      });
    }
    
    return providers;
  } catch (error) {
    console.error("Error fetching providers:", error);
    return [];
  }
};

// Toggle movie in watchlist (adds if missing, removes if exists)
export const toggleMovieWatchlist = async (movie) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const watchlistRef = doc(db, 'Users', user.uid, 'Watchlist', movie.id.toString());
    const docSnap = await getDoc(watchlistRef);

    if (docSnap.exists()) {
        await deleteDoc(watchlistRef);
        return false; // Removed from watchlist
    } else {
        // Fetch providers before adding to watchlist
        const providers = await fetchMovieProviders(movie.id);
        
        const movieData = {
            ...movie,
            providers: providers,
            timestamp: serverTimestamp()
        };

        await setDoc(watchlistRef, movieData);
        return true; // Added to watchlist
    }
};

export const addToRecents = async (movie, userId) => {
  try {
    const providers = await fetchMovieProviders(movie.id);
    
    const movieDoc = doc(db, "Users", userId, "Recents", movie.id.toString());
    const movieData = {
      title: movie.title,
      genres: movie.genres,
      id: movie.id,
      image: movie.image,
      language: movie.language,
      rating: movie.rating,
      timestamp: new Date(),
      providers: providers
    };

    await setDoc(movieDoc, movieData);
    return true;
  } catch (error) {
    console.error("Error adding to recents:", error);
    return false;
  }
};

export const getUserPreferences = async () => {
  const userProfile = await getUserProfile();

  return {
    genres:    userProfile?.genres    || [],
    languages: userProfile?.languages || ['en']  
  };
};

