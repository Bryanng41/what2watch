<template>
  <div class="questionnaire">
    <h2>Tell us about yourself</h2>
    <form @submit.prevent="handleSubmit" class="questionnaire-form">
      <div class="form-group">
        <label for="dob">Date of Birth</label>
        <input type="date" id="dob" v-model="formData.dob" required />
      </div>

      <div class="form-group">
        <label>Favorite Genres</label>
        <div class="genre-grid">
          <label v-for="genre in genres" :key="genre" class="genre-checkbox">
            <input type="checkbox" v-model="formData.genres" :value="genre" />
            <span>{{ genre }}</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>Preferred Languages</label>
        <div class="language-grid">
          <label v-for="lang in languages" :key="lang.code" class="language-checkbox">
            <input type="checkbox" v-model="formData.languages" :value="lang.name" />
            <span>{{ lang.name }}</span>
          </label>
        </div>
      </div>

      <button type="submit" class="submit-btn">Save Preferences</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  dob: '',
  genres: [],
  languages: []
})

const genres = [
  'Action', 'Comedy', 'Drama', 'Science Fiction', 'Horror', 'Romance',
  'Documentary', 'Animation', 'Thriller', 'Fantasy', 'Mystery', 'Crime'
]

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

const emit = defineEmits(['submit'])

const handleSubmit = () => {
  if (!formData.value.dob || formData.value.genres.length === 0) {
    return
  }

  emit('submit', formData.value)
}
</script>

<style scoped>
.questionnaire {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

.questionnaire h2 {
  margin-bottom: 20px;
  color: #00DE64;
}

.questionnaire-form {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  font-weight: 500;
  color: #ffffff;
}

input[type="text"],
input[type="date"] {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #333;
  background-color: #2d2d2d;
  color: white;
  width: 100%;
  box-sizing: border-box;
}

.genre-grid,
.content-type-grid,
.language-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  width: 100%;
}

.genre-checkbox,
.content-type-checkbox,
.language-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #2d2d2d;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.genre-checkbox:hover,
.content-type-checkbox:hover,
.language-checkbox:hover {
  background-color: #3d3d3d;
}

input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #00DE64;
}

.submit-btn {
  background-color: #00DE64;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 20px;
}

.submit-btn:hover {
  background-color: #00c054;
}
</style> 