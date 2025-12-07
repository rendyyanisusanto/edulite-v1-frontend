<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <Sidebar 
      :isOpen="sidebarOpen" 
      @toggle="toggleSidebar"
      @close="closeSidebar"
    />

    <!-- Main Content Wrapper -->
    <div class="main-wrapper" :class="{ 'sidebar-open': sidebarOpen }">
      <!-- Navbar -->
      <Navbar 
        @toggleSidebar="toggleSidebar"
        :userName="userName"
        :userRole="userRole"
        :sidebarOpen="sidebarOpen"
      />

      <!-- Main Content -->
      <main class="main-content">
        <div class="container-fluid py-4">
          <router-view />
        </div>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-6">
              <span class="text-muted">© 2025 {{ appName }}. All rights reserved.</span>
            </div>
            <div class="col-md-6 text-md-end">
              <span class="text-muted">Version 1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../auth/store/authStore'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'
import config from '../../config'

const authStore = useAuthStore()

const sidebarOpen = ref(window.innerWidth > 768)

const userName = computed(() => authStore.user?.name || 'User')
const userRole = computed(() => {
  const role = authStore.user?.role || 'user'
  return role.charAt(0).toUpperCase() + role.slice(1)
})
const appName = computed(() => config.appName)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  if (window.innerWidth <= 768) {
    sidebarOpen.value = false
  }
}

// Handle window resize
onMounted(() => {
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebarOpen.value = true
    }
  })
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 0;
  transition: margin-left 0.3s ease;
  width: 100%;
}

.main-wrapper.sidebar-open {
  margin-left: 280px;
  width: calc(100% - 280px);
}

.main-content {
  flex: 1;
  padding-top: 80px;
  min-height: calc(100vh - 80px);
}

.footer {
  padding: 20px 0;
  background-color: #fff;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0 !important;
  }
  
  .main-content {
    padding-top: 60px;
  }
}
</style>
