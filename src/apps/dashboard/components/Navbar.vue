<template>
  <nav class="navbar" :class="{ 'sidebar-open': sidebarOpen }">
    <div class="container-fluid">
      <div class="navbar-left">
        <button class="btn btn-link toggle-btn" @click="$emit('toggleSidebar')">
          <i class="bi bi-list fs-4"></i>
        </button>
        <h5 class="mb-0 d-none d-md-block">Dashboard</h5>
      </div>

      <div class="navbar-right">
        <!-- Notifications -->
        <div class="dropdown me-3">
          <button 
            class="btn btn-link position-relative" 
            type="button" 
            id="notificationDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="bi bi-bell fs-5"></i>
            <span 
              v-if="unreadCount > 0" 
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            >
              {{ unreadCount }}
            </span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end notification-dropdown" aria-labelledby="notificationDropdown">
            <li class="dropdown-header">
              <strong>Notifications ({{ unreadCount }})</strong>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li v-for="notification in notifications" :key="notification.id">
              <a class="dropdown-item" href="#">
                <div class="notification-item">
                  <div class="notification-icon" :class="notification.type">
                    <i :class="notification.icon"></i>
                  </div>
                  <div class="notification-content">
                    <p class="mb-0">{{ notification.message }}</p>
                    <small class="text-muted">{{ notification.time }}</small>
                  </div>
                </div>
              </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item text-center text-primary" href="#">
                Lihat semua notifikasi
              </a>
            </li>
          </ul>
        </div>

        <!-- User Profile -->
        <div class="dropdown">
          <button 
            class="btn btn-link user-profile-btn" 
            type="button" 
            id="userDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div class="user-avatar">
              {{ getInitials(userName) }}
            </div>
            <span class="d-none d-md-inline ms-2">{{ userName }}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li class="dropdown-header">
              <div class="text-center">
                <div class="user-avatar mb-2">
                  {{ getInitials(userName) }}
                </div>
                <strong>{{ userName }}</strong>
                <p class="text-muted small mb-0">{{ userRole }}</p>
              </div>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <router-link class="dropdown-item" to="/profile">
                <i class="bi bi-person me-2"></i> Profile
              </router-link>
            </li>
            <li>
              <router-link class="dropdown-item" to="/settings">
                <i class="bi bi-gear me-2"></i> Settings
              </router-link>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                <i class="bi bi-box-arrow-right me-2"></i> Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../auth/store/authStore'
import { getInitials } from '../../../shared/utils/helpers'

defineProps({
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    default: ''
  },
  sidebarOpen: {
    type: Boolean,
    default: true
  }
})

defineEmits(['toggleSidebar'])

const router = useRouter()
const authStore = useAuthStore()

// Mock notifications
const unreadCount = ref(3)
const notifications = ref([
  {
    id: 1,
    type: 'info',
    icon: 'bi bi-info-circle',
    message: 'Sistem akan maintenance besok pagi',
    time: '2 menit lalu'
  },
  {
    id: 2,
    type: 'success',
    icon: 'bi bi-check-circle',
    message: 'Data berhasil disimpan',
    time: '1 jam lalu'
  },
  {
    id: 3,
    type: 'warning',
    icon: 'bi bi-exclamation-triangle',
    message: 'Ada 5 laporan menunggu approval',
    time: '3 jam lalu'
  }
])

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1020;
  background-color: #fff;
  border-bottom: 1px solid #e9ecef;
  padding: 14px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 65px;
  transition: left 0.3s ease;
}

.navbar.sidebar-open {
  left: 280px;
}

@media (max-width: 768px) {
  .navbar {
    left: 0 !important;
  }
}

.navbar .container-fluid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 15px;
  height: 100%;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
  height: 100%;
}

.toggle-btn {
  color: #333;
  text-decoration: none;
  padding: 5px 10px;
  display: flex;
  align-items: center;
}

.toggle-btn:hover {
  background-color: #f8f9fa;
  border-radius: 8px;
}

.user-profile-btn {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  padding: 5px 10px;
}

.user-profile-btn:hover {
  background-color: #f8f9fa;
  border-radius: 8px;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.notification-dropdown {
  width: 350px;
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.notification-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.info {
  background-color: #e3f2fd;
  color: #1976d2;
}

.notification-icon.success {
  background-color: #e8f5e9;
  color: #388e3c;
}

.notification-icon.warning {
  background-color: #fff3e0;
  color: #f57c00;
}

.notification-content {
  flex: 1;
}

.notification-content p {
  font-size: 14px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .navbar {
    padding: 10px 15px;
  }
}
</style>
