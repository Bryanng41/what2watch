<template>
    <button @click="handleLogout" class="logout-button" type="submit">Log Out</button>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";

const router = useRouter()

const handleLogout = async () => {
    try {
        await signOut(auth);
        console.log("Successfully logged out");
        router.push('/guest');
    } catch (e) {
        console.log(e.code);
    }
}
</script>

<style scoped>
.logout-button {
  width: 90px;
  padding: 10px;
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
  font-family: 'Times New Roman', Times, serif;
}

.logout-button:hover {
  background-color: #00cc55;
}
</style>