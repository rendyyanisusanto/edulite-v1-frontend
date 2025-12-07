<template>
  <nav class="admin-navbar" :class="{ 'sidebar-open': sidebarOpen }">
    <div class="container-fluid">
      <div class="navbar-left">
        <button class="btn btn-link toggle-btn" @click="$emit('toggleSidebar')">
          <i class="bi bi-list fs-4"></i>
        </button>
        <div class="breadcrumb-wrapper d-none d-md-block">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><i class="bi bi-shield-check me-1"></i>Admin</li>
              <li class="breadcrumb-item active" aria-current="page">{{ currentPage }}</li>
            </ol>
          </nav>
        </div>
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
                View all notifications
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
              <router-link class="dropdown-item" to="/admin/profile">
                <i class="bi bi-person me-2"></i> Profile
              </router-link>
            </li>
            <li>
              <router-link class="dropdown-item" to="/admin/settings">
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
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
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
const route = useRoute()
const authStore = useAuthStore()

const searchQuery = ref('')
const unreadCount = ref(5)

const currentPage = computed(() => {
  const path = route.path
  const segments = path.split('/').filter(Boolean)
  return segments[segments.length - 1] || 'Dashboard'
})

const notifications = ref([
  {
    id: 1,
    type: 'warning',
    icon: 'bi bi-exclamation-triangle',
    message: 'School license expiring in 5 days',
    time: '5 min ago'
  },
  {
    id: 2,
    type: 'success',
    icon: 'bi bi-check-circle',
    message: 'New school registration approved',
    time: '1 hour ago'
  },
  {
    id: 3,
    type: 'info',
    icon: 'bi bi-info-circle',
    message: 'System backup completed successfully',
    time: '2 hours ago'
  },
  {
    id: 4,
    type: 'danger',
    icon: 'bi bi-x-circle',
    message: 'Failed login attempts detected',
    time: '3 hours ago'
  },
  {
    id: 5,
    type: 'info',
    icon: 'bi bi-info-circle',
    message: 'Monthly report is ready',
    time: '5 hours ago'
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
.admin-navbar {
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

.admin-navbar.sidebar-open {
  left: 280px;
}

@media (max-width: 768px) {
  .admin-navbar {
    left: 0 !important;
  }
}

.admin-navbar .container-fluid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
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

.breadcrumb-wrapper {
  display: flex;
  align-items: center;
}

.breadcrumb {
  background: none;
  padding: 0;
  margin: 0;
}

.breadcrumb-item {
  color: #6c757d;
  font-size: 0.9rem;
}

.breadcrumb-item.active {
  color: #333;
  font-weight: 600;
  text-transform: capitalize;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: "›";
  color: #adb5bd;
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
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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

.notification-icon.danger {
  background-color: #ffebee;
  color: #d32f2f;
}

.notification-content {
  flex: 1;
}

.notification-content p {
  font-size: 14px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .admin-navbar {
    padding: 10px 15px;
  }
  
  .breadcrumb-wrapper {
    display: none;
  }
}
</style>
