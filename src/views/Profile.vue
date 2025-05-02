<template>
  <div class="container">
    <Topbar />
    <div class="bottom-section">
      <Sidebar />
      <div class="profile-container">
        <div v-if="loading" class="loading">
          Loading profile...
        </div>
        <div v-else-if="!hasPreferences" class="no-preferences">
          <h2>Profile Not Complete</h2>
          <p>Please complete your profile preferences first.</p>
          <button @click="router.push('/onboarding')" class="setup-button">
            Setup Profile
          </button>
        </div>
        <div v-else>
          <div class="tabs">
            <button 
              :class="['tab-button', { active: activeTab === 'preferences' }]"
              @click="activeTab = 'preferences'"
            >
              Preferences
            </button>
            <button 
              :class="['tab-button', { active: activeTab === 'settings' }]"
              @click="activeTab = 'settings'"
            >
              Settings
            </button>
          </div>

          <!-- Preferences Tab -->
          <div v-if="activeTab === 'preferences'" class="preferences-content">
            <div class="section">
              <h2>Preferred Languages</h2>
              <div class="language-grid">
                <button 
                  v-for="lang in languages" 
                  :key="lang.code"
                  :class="['language-button', { selected: selectedLanguages.includes(lang.code) }]"
                  @click="toggleLanguage(lang.code)"
                >
                  {{ lang.code }}
                </button>
              </div>
            </div>

            <div class="section">
              <h2>Preferred Countries of Origin</h2>
              <div class="countries-grid">
                <button 
                  v-for="country in countries" 
                  :key="country.code"
                  :class="['country-button', { selected: selectedCountries.includes(country.code) }]"
                  @click="toggleCountry(country.code)"
                >
                  {{ country.name }}
                </button>
              </div>
            </div>

            <div class="section">
              <h2>Preferred Movie Studios</h2>
              <div class="studios-grid">
                <button 
                  v-for="studio in studios" 
                  :key="studio.name"
                  :class="['studio-button', { selected: userProfile.studios?.includes(studio.name) }]"
                  @click="toggleStudio(studio.name)"
                  :title="studio.knownFor"
                >
                  {{ studio.name }}
                </button>
              </div>
            </div>

            <div class="section">
              <h2>Favorite Directors</h2>
              <div class="directors-grid">
                <button 
                  v-for="director in directors" 
                  :key="director.name"
                  :class="['director-button', { selected: userProfile.directors?.includes(director.name) }]"
                  @click="toggleDirector(director.name)"
                  :title="director.knownFor"
                >
                  {{ director.name }}
                </button>
              </div>
            </div>

            <div class="section">
              <h2>Preferred Genres</h2>
              <div class="genres-grid">
                <button 
                  v-for="genre in genres" 
                  :key="genre"
                  :class="['genre-button', { selected: userProfile.genres?.includes(genre) }]"
                  @click="toggleGenre(genre)"
                >
                  {{ genre }}
                </button>
              </div>
            </div>

            <div class="section">
              <h2>Watching Habits</h2>
              <div class="watching-habits">
                <div class="habit-section">
                  <h3>How often do you watch?</h3>
                  <div class="radio-group">
                    <label v-for="option in watchingFrequency" :key="option">
                      <input
                        type="radio"
                        v-model="userProfile.watchingFrequency"
                        :value="option"
                      />
                      {{ option }}
                    </label>
                  </div>
                </div>

                <div class="habit-section">
                  <h3>Preferred content length</h3>
                  <div class="radio-group">
                    <label v-for="option in preferredLength" :key="option">
                      <input
                        type="radio"
                        v-model="userProfile.preferredLength"
                        :value="option"
                      />
                      {{ option }}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button @click="savePreferences" class="save-button">
              Save Changes
            </button>
          </div>

          <!-- Settings Tab -->
          <div v-else class="settings-content">
            <div class="settings-section">
              <h2>Personal Information</h2>
              <div class="setting-item">
  <label>Username</label>
  <input type="text" v-model="userProfile.username" />
</div>

<div class="setting-item">
  <label>Date of Birth</label>
  <input type="date" v-model="userProfile.dob" />
</div>

<div class="setting-item">
  <label>Email</label>
  <p>{{ userEmail }}</p> <!-- email remains non-editable -->
</div>

<button class="save-button" @click="saveBasicInfo">Save Info</button>
            </div>

            <div class="settings-section">
              <h2>Security</h2>
              <div class="setting-item">
                <label>Password</label>
                <button @click="showChangePasswordModal = true" class="change-button">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Change Password Modal -->
        <div v-if="showChangePasswordModal" class="modal">
          <div class="modal-content">
            <h2>Change Password</h2>
            <div class="form-group">
              <label>Current Password</label>
              <input type="password" v-model="currentPassword" />
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input type="password" v-model="newPassword" />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input type="password" v-model="confirmPassword" />
            </div>
            <div class="error-message" v-if="passwordError">
              {{ passwordError }}
            </div>
            <div class="modal-buttons">
              <button @click="changePassword" class="save-button">Save</button>
              <button @click="showChangePasswordModal = false" class="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject } from 'vue'
import { auth, db } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { updateUserProfile } from '@/utils/firebaseActions';
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateProfile } from 'firebase/auth'
import { useRouter, useRoute } from 'vue-router'
import Topbar from '../components/Topbar.vue'
import Sidebar from '../components/Sidebar.vue'

const router = useRouter()
const route = useRoute()
const activeTab = ref(route.query.tab === 'settings' ? 'settings' : 'preferences')
const userProfile = ref({})
const userEmail = ref('')
const loading = ref(true)
const hasPreferences = computed(() => Object.keys(userProfile.value).length > 0)
const currentUser = inject('currentUser');


// Password change state
const showChangePasswordModal = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')

// Preferences data
const languages = [
  { code: 'EN', name: 'English' },
  { code: 'ES', name: 'Spanish' },
  { code: 'FR', name: 'French' },
  { code: 'DE', name: 'German' },
  { code: 'RU', name: 'Russian' },
  { code: 'ZH', name: 'Chinese' },
  { code: 'KR', name: 'Korean' },
  { code: 'JP', name: 'Japanese' },
  { code: 'HI', name: 'Hindi' }
]

const countries = [
  { code: 'UK', name: 'UK' },
  { code: 'US', name: 'US' },
  { code: 'ES', name: 'Spain' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'RU', name: 'Russia' },
  { code: 'CN', name: 'China' },
  { code: 'KR', name: 'Korea' },
  { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' }
]

const genres = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", 
  "Documentary", "Drama", "Family", "Fantasy", "History",
  "Horror", "Music", "Mystery", "Romance", "Science Fiction", 
  "TV Movie", "Thriller", "War", "Western"
]

const selectedLanguages = ref([])
const selectedCountries = ref([])

const studios = [
  { name: 'Marvel Studios', knownFor: 'Superhero films' },
  { name: 'Warner Bros.', knownFor: 'Diverse portfolio' },
  { name: 'Disney', knownFor: 'Animation and family films' },
  { name: 'Universal', knownFor: 'Blockbusters' },
  { name: 'A24', knownFor: 'Independent films' },
  { name: 'Pixar', knownFor: 'Animation' },
  { name: 'Sony Pictures', knownFor: 'Various genres' },
  { name: 'Paramount', knownFor: 'Major productions' },
  { name: 'Netflix Studios', knownFor: 'Streaming originals' },
  { name: 'Studio Ghibli', knownFor: 'Japanese animation' }
]

const directors = [
  { name: 'Christopher Nolan', knownFor: 'Inception, The Dark Knight' },
  { name: 'Steven Spielberg', knownFor: 'Jurassic Park, E.T.' },
  { name: 'Martin Scorsese', knownFor: 'Goodfellas, The Departed' },
  { name: 'Quentin Tarantino', knownFor: 'Pulp Fiction, Kill Bill' },
  { name: 'Greta Gerwig', knownFor: 'Lady Bird, Little Women' },
  { name: 'Denis Villeneuve', knownFor: 'Dune, Arrival' },
  { name: 'Hayao Miyazaki', knownFor: 'Spirited Away, My Neighbor Totoro' },
  { name: 'Bong Joon-ho', knownFor: 'Parasite, Snowpiercer' }
]

const watchingFrequency = [
  'Daily',
  'Few times a week',
  'Weekly',
  'Few times a month',
  'Monthly'
]

const preferredLength = [
  'Under 1.5 hours',
  '1.5 to 2 hours',
  '2 to 2.5 hours',
  'Over 2.5 hours'
]

const toggleLanguage = (code) => {
  const index = selectedLanguages.value.indexOf(code)
  if (index === -1) {
    selectedLanguages.value.push(code)
  } else {
    selectedLanguages.value.splice(index, 1)
  }
}

const toggleCountry = (code) => {
  const index = selectedCountries.value.indexOf(code)
  if (index === -1) {
    selectedCountries.value.push(code)
  } else {
    selectedCountries.value.splice(index, 1)
  }
}

const toggleGenre = (genre) => {
  if (!userProfile.value.genres) {
    userProfile.value.genres = []
  }
  const index = userProfile.value.genres.indexOf(genre)
  if (index === -1) {
    userProfile.value.genres.push(genre)
  } else {
    userProfile.value.genres.splice(index, 1)
  }
}

const formatDate = (date) => {
  if (!date) return 'Not set'
  return new Date(date).toLocaleDateString()
}

const savePreferences = async () => {
  try {
    const languageFullNames = selectedLanguages.value.map(code => {
      const lang = languages.find(l => l.code === code);
      return lang ? lang.name : code;
    });

    const countryFullNames = selectedCountries.value.map(code => {
      const country = countries.find(c => c.code === code);
      return country ? country.name : code;
    });

    const updatedPreferences = {
      ...userProfile.value,
      languages: languageFullNames,
      countries: countryFullNames,
      updatedAt: new Date().toISOString()
    };

    await updateUserProfile(updatedPreferences);
    alert('Preferences saved successfully!');
  } catch (error) {
    console.error('Error saving preferences:', error);
    alert('Failed to save preferences');
  }
};


const saveBasicInfo = async () => {
  try {
    const user = auth.currentUser

    const updatedInfo = {
      ...userProfile.value,
      updatedAt: new Date().toISOString()
    }

    if (user && userProfile.value.username) {
      await updateProfile(user, { displayName: userProfile.value.username })
      await user.reload() // reload to ensure latest info

      // Update the injected global
      if (currentUser) {
        currentUser.value = { ...auth.currentUser }
      }
    }

    await updateUserProfile(updatedInfo)
    alert('Personal information updated successfully!')
  } catch (error) {
    console.error('Error updating personal info:', error)
    alert('Failed to update personal info.')
  }
}

const changePassword = async () => {
  try {
    passwordError.value = ''
    
    if (newPassword.value !== confirmPassword.value) {
      passwordError.value = 'New passwords do not match'
      return
    }

    const user = auth.currentUser
    const credential = EmailAuthProvider.credential(user.email, currentPassword.value)
    
    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, newPassword.value)
    
    showChangePasswordModal.value = false
    alert('Password updated successfully!')
    
    // Clear the form
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    console.error('Error changing password:', error)
    passwordError.value = 'Failed to change password. Please check your current password.'
  }
}

const toggleStudio = (studioName) => {
  if (!userProfile.value.studios) {
    userProfile.value.studios = []
  }
  const index = userProfile.value.studios.indexOf(studioName)
  if (index === -1) {
    userProfile.value.studios.push(studioName)
  } else {
    userProfile.value.studios.splice(index, 1)
  }
}

const toggleDirector = (directorName) => {
  if (!userProfile.value.directors) {
    userProfile.value.directors = []
  }
  const index = userProfile.value.directors.indexOf(directorName)
  if (index === -1) {
    userProfile.value.directors.push(directorName)
  } else {
    userProfile.value.directors.splice(index, 1)
  }
}

onMounted(async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userEmail.value = user.email;
      try {
        const userPrefsDoc = await getDoc(doc(db, 'Users', user.uid));
        if (userPrefsDoc.exists()) {
          const data = userPrefsDoc.data();
          userProfile.value = data;

          // Convert stored names to codes
          selectedLanguages.value = (data.languages || []).map(name => {
            const lang = languages.find(l => l.name === name || l.code === name);
            return lang?.code || name;
          });

          selectedCountries.value = (data.countries || []).map(name => {
            const country = countries.find(c => c.name === name || c.code === name);
            return country?.code || name;
          });

        } else {
          console.log('No preferences found, redirecting to onboarding');
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        loading.value = false;
      }
    } else {
      router.push('/login');
    }
  });
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #0A0A0A;
  overflow: hidden;
}

.bottom-section {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.bottom-section > *:first-child {
  width: 220px;
  flex-shrink: 0;
}

.profile-container {
  flex: 1;
  padding: 2rem;
  color: white;
  margin-left: 0;
  max-width: calc(100% - 200px);
  overflow-y: auto;
}

.tabs {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #333;
  padding-bottom: 1rem;
}

.tab-button {
  background: transparent;
  border: none;
  color: #888;
  font-size: 1.2rem;
  padding: 0.5rem 0;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
  font-family: 'Times New Roman', Times, serif;
}

.tab-button.active {
  color: #00DE64;
  border-bottom-color: #00DE64;
}

.section {
  background: #1A1A1A;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  width: calc(100% - 2rem);
  margin-right: 2rem;
}

.section h2 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.language-grid,
.countries-grid,
.studios-grid,
.directors-grid,
.genres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
  width: 100%;
}

.language-button,
.country-button,
.studio-button,
.director-button,
.genre-button {
  background: #2D2D2D;
  border: none;
  color: white;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Times New Roman', Times, serif;
  font-size: 1rem;
}

.language-button.selected,
.country-button.selected,
.studio-button.selected,
.director-button.selected,
.genre-button.selected {
  background: #00DE64;
  color: black;
}

.watching-habits {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.habit-section h3 {
  color: #888;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.radio-group {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  cursor: pointer;
}

.radio-group input[type="radio"] {
  accent-color: #00DE64;
}

.save-button {
  background: #00DE64;
  color: black;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1rem;
  transition: all 0.3s ease;
  font-family: 'Times New Roman', Times, serif;
  font-size: 1rem;
}

.save-button:hover {
  background: #00c058;
}

.settings-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
}

.settings-section {
  background: #1A1A1A;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.setting-item {
  margin: 1rem 0;
}

.setting-item label {
  display: block;
  color: #888;
  margin-bottom: 0.5rem;
}

.change-button {
  background: #00DE64;
  color: black;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Times New Roman', Times, serif;
  font-size: 1rem;
}

.change-button:hover {
  background: #00c058;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #2d2d2d;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin: 1rem 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #888;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-button {
  background: transparent;
  border: 1px solid #00DE64;
  color: #00DE64;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.error-message {
  color: #ff6b6b;
  margin-top: 0.5rem;
}

.genres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}

.genre-button {
  background: #2D2D2D;
  border: none;
  color: white;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  text-align: left;
}

.genre-button.selected {
  background: #00DE64;
  color: black;
}
</style> 