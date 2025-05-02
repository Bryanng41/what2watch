<template>
    <div class="reset-password-container">
        <div class="reset-password-box">
            <h2 class="reset-password-title">Reset Password</h2>
            <span>An email will be sent to this email address. You will receive instructions for resetting your password.</span>
            <input class="input-field" type="email" v-model="email" placeholder="Email Address" :class="{'input-error': invalidEmail}" required />
            <span v-if="invalidEmail" class="error-message">Incorrect email format!</span>
            <span v-if="sentEmail" class="success-message">Reset email sent successfully!</span>
            <button v-if="!sentEmail" @click="resetPassword" class="reset-password-button" type="submit">Reset Password</button>
            <button v-if="sentEmail" @click="goToLogin" class="login-button" type="submit">Log In</button>
        </div>
    </div>
</template>

<script setup>
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase";
import { ref } from 'vue';
import { useRouter } from "vue-router";

const router = useRouter();

const email = ref('');
const invalidEmail = ref(false);
const sentEmail = ref(false);

const resetPassword = async () => {
  invalidEmail.value = false;
  sentEmail.value = false; 
  try {
      await sendPasswordResetEmail(auth, email.value);
      console.log("Password reset email sent");
      sentEmail.value = true;
  } catch (e) {
    if (e.code == "auth/invalid-email") {
      invalidEmail.value = true;
      email.value = '';
    } else {
      alert("Password reset email failed to send");
      console.log(e.code);
    }
  }
};

const goToLogin = async () => {
  router.push("/login");
}

</script>

<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: white;
}

.reset-password-box {
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

.reset-password-title {
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
}

.reset-password-button {
  width: 100%;
  padding: 12px;
  background-color: #00ff66;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  color: black;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.reset-password-button:hover {
  background-color: #00cc55;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #00ff66;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  color: black;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.login-button:hover {
  background-color: #00cc55;
}

.input-error {
    border: 1px solid red;
}

.error-message {
    color: red;
}

.success-message {
  color: #00ff66;
}
</style>