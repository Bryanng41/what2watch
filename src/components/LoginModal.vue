<template>
    <div class="login-container">
        <div class="login-box">
            <h2 class="login-title">Log In</h2>
            <form @submit.prevent="handleLogin">
                <input class="input-field" type="email" v-model="email" placeholder="Email Address" :class="{'input-error': invalidCredentials}" required />
                <input class="input-field" type="password" v-model="password" placeholder="Password" :class="{'input-error': invalidCredentials}" required />
                <span v-if="invalidCredentials" class="error-message">Incorrect email/password!</span>                
                <button class="login-button" type="submit">Log In</button>
            </form>
            <span class="forgot-password"><router-link class="router-link" :to="{name: 'ForgetPassword'}">Forgot password?</router-link></span>
            <span class="register-link">Haven't got an account? Register <router-link class="router-link" :to="{name: 'Register'}">here</router-link></span>
        </div>
    </div>
</template>

<script setup>
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { ref } from 'vue';
import { useRouter } from "vue-router";

const router = useRouter();

const email = ref('');
const password = ref('');
const invalidCredentials = ref(false);

const handleLogin = async () => {
    try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        await auth.currentUser.reload();

        console.log("Login successful")
        router.push("/dashboard");
    } catch (e) {
      if (e.code === "auth/invalid-credential") {
        invalidCredentials.value = true;
        password.value = '';
      } else {
        alert("Login failed, please try again");
      }
    }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: rgb(0, 0, 0);
}

.login-box {
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

.login-title,
.forgot-password,
.register-link {
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

.login-button {
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

.login-button:hover {
  background-color: #00cc55;
}

.forgot-password, .register-link {
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
</style>