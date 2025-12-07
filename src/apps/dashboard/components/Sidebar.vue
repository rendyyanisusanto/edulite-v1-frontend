<template>
  <aside class="sidebar" :class="{ 'open': isOpen }">
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <div class="logo-wrapper">
        <div class="logo-icon">
          <i class="bi bi-mortarboard-fill"></i>
        </div>
        <div class="logo-text">
          <h4 class="mb-0">{{ appName }}</h4>
          <small>Management System</small>
        </div>
      </div>
      <button class="btn btn-link close-btn d-md-none" @click="$emit('close')">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <!-- Sidebar Navigation -->
    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <ul class="nav flex-column">
          <li class="nav-section-title">
            <span>MENU UTAMA</span>
          </li>
          
          <li 
            v-for="item in menuItems" 
            :key="item.path"
            class="nav-item"
          >
            <router-link 
              :to="item.path" 
              class="nav-link"
              :class="{ 'active': isActive(item.path) }"
              @click="handleMenuClick"
            >
              <i :class="item.icon"></i>
              <span>{{ item.label }}</span>
              <span v-if="item.badge" class="badge rounded-pill bg-danger">{{ item.badge }}</span>
            </router-link>
          </li>

          <!-- Admin Section -->
          <li v-if="isSuperAdmin" class="nav-section-title">
            <span>ADMINISTRASI</span>
          </li>

          <li 
            v-for="item in adminMenuItems" 
            :key="item.path"
            v-if="isSuperAdmin"
            class="nav-item"
          >
            <router-link 
              :to="item.path" 
              class="nav-link"
              :class="{ 'active': isActive(item.path) }"
              @click="handleMenuClick"
            >
              <i :class="item.icon"></i>
              <span>{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Sidebar Footer with User Profile & Logout -->
    <div class="sidebar-footer">
      <!-- User Profile Card -->
      <div class="user-profile-card">
        <div class="user-avatar-small">
          {{ getInitials(userName) }}
        </div>
        <div class="user-info-footer">
          <h6 class="mb-0">{{ userName }}</h6>
          <small>{{ userRole }}</small>
        </div>
      </div>

      <!-- Logout Button -->
      <button class="logout-btn" @click="handleLogout">
        <i class="bi bi-box-arrow-left"></i>
        <span>Logout</span>
      </button>
    </div>
  </aside>

  <!-- Overlay for mobile -->
  <div 
    v-if="isOpen" 
    class="sidebar-overlay d-md-none" 
    @click="$emit('close')"
  ></div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../auth/store/authStore'
import { getInitials } from '../../../shared/utils/helpers'
import config from '../../../config'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['toggle', 'close'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const appName = computed(() => config.appName)
const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const userName = computed(() => authStore.user?.name || 'User')
const userRole = computed(() => {
  const role = authStore.user?.role || 'user'
  // Capitalize first letter
  return role.charAt(0).toUpperCase() + role.slice(1)
})

// Menu items untuk semua user
const menuItems = computed(() => [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'bi bi-house-door'
  },
  {
    path: '/students',
    label: 'Siswa',
    icon: 'bi bi-people'
  },
  {
    path: '/teachers',
    label: 'Guru',
    icon: 'bi bi-person-badge'
  },
  {
    path: '/classes',
    label: 'Kelas',
    icon: 'bi bi-building'
  },
  {
    path: '/subjects',
    label: 'Mata Pelajaran',
    icon: 'bi bi-book'
  },
  {
    path: '/schedule',
    label: 'Jadwal',
    icon: 'bi bi-calendar3'
  },
  {
    path: '/attendance',
    label: 'Absensi',
    icon: 'bi bi-check2-square'
  },
  {
    path: '/grades',
    label: 'Nilai',
    icon: 'bi bi-trophy'
  },
  {
    path: '/reports',
    label: 'Laporan',
    icon: 'bi bi-file-earmark-text',
    badge: 5
  }
])

// Menu khusus admin/superadmin
const adminMenuItems = computed(() => [
  {
    path: '/schools',
    label: 'Sekolah',
    icon: 'bi bi-building'
  },
  {
    path: '/users',
    label: 'Manajemen User',
    icon: 'bi bi-person-gear'
  },
  {
    path: '/settings',
    label: 'Pengaturan',
    icon: 'bi bi-gear'
  },
  {
    path: '/logs',
    label: 'Activity Logs',
    icon: 'bi bi-clock-history'
  }
])

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const handleMenuClick = () => {
  emit('close')
}

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
.sidebar {
  position: fixed;
  top: 0;
  left: -280px;
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1050;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar.open {
  left: 0;
}

/* Sidebar Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.logo-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #0652DD 0%, #2d7ff9 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.logo-text h4 {
  font-weight: 700;
  font-size: 1.1rem;
  color: white;
  margin-bottom: 2px;
}

.logo-text small {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.close-btn {
  color: white;
  padding: 5px;
  opacity: 0.7;
}

.close-btn:hover {
  opacity: 1;
}

/* Sidebar Content */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px 0;
}

.sidebar-nav .nav-section-title {
  padding: 15px 20px 8px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.sidebar-nav .nav-item {
  margin-bottom: 2px;
  padding: 0 12px;
}

.sidebar-nav .nav-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.sidebar-nav .nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: linear-gradient(135deg, #0652DD 0%, #2d7ff9 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.sidebar-nav .nav-link i {
  font-size: 18px;
  width: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.sidebar-nav .nav-link .badge {
  margin-left: auto;
  font-size: 0.7rem;
  padding: 3px 7px;
}

.sidebar-nav .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(3px);
}

.sidebar-nav .nav-link.active {
  background: linear-gradient(135deg, rgba(6, 82, 221, 0.2) 0%, rgba(45, 127, 249, 0.2) 100%);
  color: white;
  font-weight: 600;
}

.sidebar-nav .nav-link.active::before {
  transform: scaleY(1);
}

.sidebar-nav .nav-link.active:hover {
  background: linear-gradient(135deg, rgba(6, 82, 221, 0.3) 0%, rgba(45, 127, 249, 0.3) 100%);
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 15px 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

/* User Profile Card in Footer */
.user-profile-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.user-profile-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(6, 82, 221, 0.3);
  transform: translateY(-2px);
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0652DD 0%, #2d7ff9 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(6, 82, 221, 0.3);
}

.user-info-footer h6 {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-info-footer small {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  text-transform: capitalize;
}

/* Logout Button */
.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #fca5a5;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn i {
  font-size: 18px;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  color: #ef4444;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.logout-btn:active {
  transform: translateY(0);
}

/* Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1035;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive */
@media (min-width: 769px) {
  .sidebar.open {
    left: 0;
  }
}

/* Scrollbar styling */
.sidebar-content::-webkit-scrollbar {
  width: 5px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
