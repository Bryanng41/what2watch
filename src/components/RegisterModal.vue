<template>
    <div class="register-container">
        <div class="register-box">
            <button class="back-button" @click="$router.push('/login')">← Back</button>
            <h2 class="register-title">Sign Up</h2>
            <form @submit.prevent="handleRegister">
                <input class="input-field" type="text" v-model="username" placeholder="Username" required />
                <input class="input-field" type="email" v-model="email" placeholder="Email Address" :class="{'input-error': emailInUse || invalidEmail}" required />
                <span v-if="emailInUse" class="error-message">Email is already in use!</span>
                <span v-if="invalidEmail" class="error-message">Incorrect email format!</span>
                <input class="input-field" type="password" v-model="password" placeholder="Password" required />
                <div class="password-validation">
                  <p>Password must contain:</p>
                  <p class="invalid" :class="{'valid': valid.uppercase}"> At least 1 uppercase character</p>
                  <p class="invalid" :class="{'valid': valid.lowercase}"> At least 1 lowercase character</p>
                  <p class="invalid" :class="{'valid': valid.numeric}"> At least 1 numeric character</p>
                  <p class="invalid" :class="{'valid': valid.special}"> At least 1 special character</p>
                  <p class="invalid" :class="{'valid': valid.length}"> Minimum 8 characters</p>
                </div>
                <input class="input-field" type="password" v-model="confirmPassword" placeholder="Confirm Password" :class="{'input-error': passwordMismatch}" required />
                <span v-if="passwordMismatch" class="error-message">Passwords do not match!</span>
                <button class="register-button" type="submit">Sign Up</button>
            </form>
            <span class="login-link">Already got an account? Login <router-link class="router-link" :to="{name: 'Login'}">here</router-link></span>
        </div>
    </div>
</template>

<script setup>
import { auth } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { computed, ref } from 'vue';
import { useRouter } from "vue-router";

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const emailInUse = ref(false);
const invalidEmail = ref(false);

const router = useRouter();

const valid = computed(() => {
  // Regex expression to check for patterns in password
  const uppercase = /[A-Z]/.test(password.value);
  const lowercase = /[a-z]/.test(password.value);
  const special = /[!@#$%^&*(),.?":{}|<>]/.test(password.value);
  const numeric = /[0-9]/.test(password.value);
  const length = password.value.length >= 8;

  return {
    uppercase, lowercase, special, numeric, length
  };
});
const passwordMismatch = computed(() => password.value && confirmPassword.value && password.value !== confirmPassword.value);

const handleRegister = async () => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        await updateProfile(userCredential.user, {displayName: username.value});
        await auth.currentUser.reload();
        console.log("Registration successful");
        router.push("/onboarding");
    } catch (e) {
      if (e.code === "auth/email-already-in-use") {
        emailInUse.value = true;
      } else if (e.code === "auth/invalid-email") {
        invalidEmail.value = true;
      } else {
        alert("Registration failed, please try again");
        console.log("Registration failed:", e.code);
      }
    }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: rgb(0, 0, 0);
}

.register-box {
  position: relative;
  background-color: #333;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
  width: 350px;
  text-align: center;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.register-title,
.login-link {
  width: 100%;
  text-align: center;
}

.input-field {
  color: white;
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid white;
  border-radius: 5px;
  background: #222;
  font-size: 16px;
  box-sizing: border-box;
  outline: none;
}

.input-field::placeholder {
    color: white;
    font-family: 'Times New Roman', Times, serif;
}

.register-box .password-validation {
  text-align: left;
}

.password-validation .invalid {
  color: red;
}

.invalid::before {
  content: '✘';
  color: red;
}

.password-validation .valid {
  color: #00ff66;
}

.valid::before {
  content: '✔';
  color: #00ff66;
}

p {
  margin: 5px 0px;
}

.register-button {
  width: 100%;
  padding: 12px;
  background-color: #00ff66;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  color: black;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
  font-family: 'Times New Roman', Times, serif;
}

.register-button:hover {
  background-color: #00cc55;
}

.login-link {
  font-size: 16px;
  display: block;
  margin: 10px;
  text-align: left;
}

.router-link {
  color: #00ff66; 
}

.input-error {
    border: 1px solid red;
}

.error-message {
    color: red;
}

.back-button {
    position: absolute;
    top: 20px;
    left: 20px;
    background: none;
    border: none;
    color: #00ff66;
    font-size: 16px;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.back-button:hover {
    background-color: rgba(0, 255, 102, 0.1);
}

</style>