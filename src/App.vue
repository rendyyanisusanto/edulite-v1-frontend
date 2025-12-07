<template>
  <router-view />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from './apps/auth/store/authStore'
import { startTokenMonitor, stopTokenMonitor } from './shared/utils/tokenMonitor'

const authStore = useAuthStore()

onMounted(() => {
  // Check auth status saat aplikasi dimuat
  authStore.checkAuth()
  
  // Start monitoring token expiration
  if (authStore.isLoggedIn) {
    startTokenMonitor()
  }
})

onUnmounted(() => {
  // Stop monitoring when app is unmounted
  stopTokenMonitor()
})
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
