<template>
  <aside class="admin-sidebar" :class="{ 'open': isOpen }">
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <div class="logo-wrapper">
        <div class="logo-icon">
          <i class="bi bi-shield-check"></i>
        </div>
        <div class="logo-text">
          <h4 class="mb-0">{{ appName }}</h4>
          <small>Admin Panel</small>
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
          <!-- Overview Section -->
          <li class="nav-section-title">
            <span>OVERVIEW</span>
          </li>
          
          <li 
            v-for="item in mainMenuItems" 
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

          <!-- Grouped Management Sections -->
          <li class="nav-section-title">
            <span>MANAJEMEN</span>
          </li>

          <li 
            v-for="group in menuGroups" 
            :key="group.key"
            class="nav-item nav-group"
          >
            <!-- Group Header -->
            <div 
              class="nav-group-header"
              @click="toggleGroup(group.key)"
            >
              <div class="group-header-content">
                <i :class="group.icon"></i>
                <span>{{ group.label }}</span>
              </div>
              <i 
                class="bi bi-chevron-down toggle-icon"
                :class="{ 'rotated': expandedGroups[group.key] }"
              ></i>
            </div>

            <!-- Group Items -->
            <transition name="collapse">
              <ul v-show="expandedGroups[group.key]" class="nav-group-items">
                <li 
                  v-for="item in group.items" 
                  :key="item.path"
                  class="nav-group-item"
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
            </transition>
          </li>

          <!-- EDULITE MODULES Section -->
          <li class="nav-section-title">
            <span>EDULITE MODULES</span>
          </li>

          <!-- EDULITE MODULES Groups -->
          <li 
            v-for="group in eduLiteModules" 
            :key="group.key"
            class="nav-group"
          >
            <div 
              class="nav-group-header"
              @click="toggleGroup(group.key)"
            >
              <div class="group-header-content">
                <i :class="group.icon"></i>
                <span>{{ group.label }}</span>
              </div>
              <i 
                class="bi bi-chevron-down toggle-icon"
                :class="{ 'rotated': expandedGroups[group.key] }"
              ></i>
            </div>

            <!-- Group Items -->
            <transition name="collapse">
              <ul v-show="expandedGroups[group.key]" class="nav-group-items">
                <li 
                  v-for="item in group.items" 
                  :key="item.path"
                  class="nav-group-item"
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
            </transition>
          </li>

          <!-- System Section -->
          <li class="nav-section-title">
            <span>SISTEM</span>
          </li>

          <li 
            v-for="item in systemMenuItems" 
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
import { ref, computed } from 'vue'
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
const userName = computed(() => authStore.user?.name || 'Admin')
const userRole = computed(() => {
  const role = authStore.user?.role || 'admin'
  return role.charAt(0).toUpperCase() + role.slice(1)
})

// Collapsible menu state
const expandedGroups = ref({
  school: true,
  students: false,
  teachers: false,
  users: false
})

const toggleGroup = (groupKey) => {
  expandedGroups.value[groupKey] = !expandedGroups.value[groupKey]
}

// Main menu items
const mainMenuItems = computed(() => [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: 'bi bi-speedometer2'
  },
  {
    path: '/admin/analytics',
    label: 'Analytics',
    icon: 'bi bi-graph-up'
  },
  {
    path: '/admin/reports',
    label: 'Reports',
    icon: 'bi bi-file-earmark-bar-graph',
    badge: 3
  }
])

// Grouped menu items
const menuGroups = computed(() => [
  {
    key: 'school',
    label: 'Manajemen Sekolah',
    icon: 'bi bi-buildings',
    items: [
      { path: '/admin/schools', label: 'Profil Sekolah', icon: 'bi bi-building' },
      { path: '/admin/academic-years', label: 'Tahun Akademik', icon: 'bi bi-calendar-range' },
      { path: '/admin/grades', label: 'Tingkat Kelas', icon: 'bi bi-mortarboard' },
      { path: '/admin/departments', label: 'Jurusan', icon: 'bi bi-diagram-3' },
      { path: '/admin/classes', label: 'Kelas', icon: 'bi bi-door-open' }
    ]
  },
  {
    key: 'students',
    label: 'Manajemen Siswa',
    icon: 'bi bi-person-badge',
    items: [
      { path: '/admin/students', label: 'Data Siswa', icon: 'bi bi-person-lines-fill' },
      { path: '/admin/student-documents', label: 'Dokumen Siswa', icon: 'bi bi-file-earmark-text' },
      { path: '/admin/student-mutations', label: 'Mutasi', icon: 'bi bi-arrow-left-right' },
      { path: '/admin/class-placements', label: 'Penempatan Kelas', icon: 'bi bi-diagram-2' }
    ]
  },
  {
    key: 'teachers',
    label: 'Manajemen Guru',
    icon: 'bi bi-person-workspace',
    items: [
      { path: '/admin/teachers', label: 'Data Guru', icon: 'bi bi-person-vcard' },
      { path: '/admin/homeroom-teachers', label: 'Wali Kelas', icon: 'bi bi-person-check' },
      { path: '/admin/teacher-schedules', label: 'Jadwal Guru', icon: 'bi bi-calendar3' }
    ]
  },
  {
    key: 'users',
    label: 'Manajemen User',
    icon: 'bi bi-people',
    items: [
      { path: '/admin/users', label: 'Data User', icon: 'bi bi-person-fill-gear' },
      { path: '/admin/roles', label: 'Role & Permission', icon: 'bi bi-shield-lock' }
    ]
  }
])

// EduLite Modules
const eduLiteModules = computed(() => [
  {
    key: 'prestasi',
    label: 'Prestasi',
    icon: 'bi bi-trophy',
    items: [
      { path: '/admin/achievements', label: 'Data Lomba & Prestasi', icon: 'bi bi-award' },
      { path: '/admin/achievement-reports', label: 'Laporan Prestasi', icon: 'bi bi-file-earmark-bar-graph' }
    ]
  },
  {
    key: 'guestbook',
    label: 'Buku Tamu',
    icon: 'bi bi-book',
    items: [
      { path: '/admin/guestbooks', label: 'Daftar Buku Tamu', icon: 'bi bi-journal-text' },
      { path: '/admin/guestbook-reports', label: 'Laporan Buku Tamu', icon: 'bi bi-file-text' }
    ]
  },
  {
    key: 'correspondence',
    label: 'Surat Menyurat',
    icon: 'bi bi-envelope-paper',
    items: [
      { path: '/admin/incoming-letters', label: 'Surat Masuk', icon: 'bi bi-inbox' },
      { path: '/admin/outgoing-letters', label: 'Surat Keluar', icon: 'bi bi-send' }
    ]
  },
  {
    key: 'announcements',
    label: 'Pengumuman',
    icon: 'bi bi-megaphone',
    items: [
      { path: '/admin/announcements', label: 'Daftar Pengumuman', icon: 'bi bi-card-list' },
      { path: '/admin/broadcast', label: 'Broadcast Notifikasi', icon: 'bi bi-broadcast' },
      { path: '/admin/announcement-reports', label: 'Laporan', icon: 'bi bi-file-text' }
    ]
  },
  {
    key: 'archives',
    label: 'Arsip Dokumen',
    icon: 'bi bi-archive',
    items: [
      { path: '/admin/documents', label: 'Daftar Dokumen', icon: 'bi bi-files' },
      { path: '/admin/archive-reports', label: 'Laporan Arsip', icon: 'bi bi-file-earmark-ruled' }
    ]
  },
  {
    key: 'inventory',
    label: 'Inventaris',
    icon: 'bi bi-box-seam',
    items: [
      { path: '/admin/assets', label: 'Daftar Aset', icon: 'bi bi-box' },
      { path: '/admin/asset-loans', label: 'Daftar Peminjaman', icon: 'bi bi-clipboard-check' },
      { path: '/admin/asset-returns', label: 'Pengembalian Aset', icon: 'bi bi-arrow-return-left' },
      { path: '/admin/loan-history', label: 'Riwayat Peminjaman', icon: 'bi bi-clock-history' }
    ]
  },
  {
    key: 'extracurricular',
    label: 'Ekstrakurikuler',
    icon: 'bi bi-balloon',
    items: [
      { path: '/admin/extracurriculars', label: 'Daftar Ekskul', icon: 'bi bi-list-ul' },
      { path: '/admin/extracurricular-schedules', label: 'Jadwal Ekskul', icon: 'bi bi-calendar-week' },
      { path: '/admin/extracurricular-coaches', label: 'Pembina Ekskul', icon: 'bi bi-person-badge' },
      { path: '/admin/extracurricular-members', label: 'Anggota Ekskul', icon: 'bi bi-people' },
      { path: '/admin/extracurricular-reports', label: 'Laporan', icon: 'bi bi-file-text' }
    ]
  },
  {
    key: 'schedule',
    label: 'Jadwal Pelajaran',
    icon: 'bi bi-calendar2-week',
    items: [
      { path: '/admin/schedule-by-class', label: 'Jadwal Per Kelas', icon: 'bi bi-grid' },
      { path: '/admin/schedule-by-teacher', label: 'Jadwal Per Guru', icon: 'bi bi-person' },
      { path: '/admin/schedule-by-subject', label: 'Jadwal Per Mapel', icon: 'bi bi-book' },
      { path: '/admin/auto-schedule', label: 'Generate Jadwal Otomatis', icon: 'bi bi-magic' },
      { path: '/admin/rooms', label: 'Ruangan', icon: 'bi bi-door-closed' },
      { path: '/admin/subjects', label: 'Mapel', icon: 'bi bi-journal-bookmark' },
      { path: '/admin/time-slots', label: 'Jam Pelajaran', icon: 'bi bi-clock' },
      { path: '/admin/schedule-reports', label: 'Laporan Jadwal Pelajaran', icon: 'bi bi-file-bar-graph' }
    ]
  },
  {
    key: 'attendance',
    label: 'Absensi Akademik',
    icon: 'bi bi-calendar-check',
    items: [
      { path: '/admin/daily-attendance', label: 'Absensi Harian Wali Kelas', icon: 'bi bi-calendar-day' },
      { path: '/admin/subject-attendance', label: 'Absensi Per Mapel', icon: 'bi bi-journal-check' },
      { path: '/admin/student-attendance-recap', label: 'Rekap Absensi Per Siswa', icon: 'bi bi-person-check' },
      { path: '/admin/class-attendance-recap', label: 'Rekap Absensi Per Kelas', icon: 'bi bi-card-checklist' },
      { path: '/admin/teacher-attendance-recap', label: 'Rekap Absensi Per Guru Mapel', icon: 'bi bi-person-badge' },
      { path: '/admin/absence-categories', label: 'Kategori Ketidakhadiran (S, I, A, T)', icon: 'bi bi-tags' },
      { path: '/admin/attendance-reports', label: 'Laporan Absensi Akademik', icon: 'bi bi-file-earmark-spreadsheet' }
    ]
  },
  {
    key: 'permission',
    label: 'Perizinan',
    icon: 'bi bi-card-text',
    items: [
      { path: '/admin/permissions', label: 'Daftar Izin', icon: 'bi bi-list-check' },
      { path: '/admin/permission-letters', label: 'Surat Izin', icon: 'bi bi-envelope' },
      { path: '/admin/submit-permission', label: 'Ajukan Izin', icon: 'bi bi-plus-circle' },
      { path: '/admin/approve-permission', label: 'Approval Izin', icon: 'bi bi-check-circle' },
      { path: '/admin/permission-categories', label: 'Kategori Izin', icon: 'bi bi-tags' },
      { path: '/admin/permission-history', label: 'Histori Izin', icon: 'bi bi-clock-history' },
      { path: '/admin/permission-reports', label: 'Laporan Perizinan', icon: 'bi bi-file-text' }
    ]
  },
  {
    key: 'violations',
    label: 'Pelanggaran/BK',
    icon: 'bi bi-exclamation-triangle',
    items: [
      { path: '/admin/violations', label: 'Daftar Pelanggaran Siswa', icon: 'bi bi-exclamation-circle' },
      { path: '/admin/punishments', label: 'Jenis Hukuman / Tindakan', icon: 'bi bi-hammer' },
      { path: '/admin/violation-points', label: 'Rekap Poin Pelanggaran Per Siswa', icon: 'bi bi-bar-chart' },
      { path: '/admin/parent-calls', label: 'Panggilan Orang Tua', icon: 'bi bi-telephone' },
      { path: '/admin/violation-reports', label: 'Laporan BK', icon: 'bi bi-file-medical' }
    ]
  },
  {
    key: 'agenda',
    label: 'Agenda Sekolah',
    icon: 'bi bi-calendar-event',
    items: [
      { path: '/admin/school-agenda', label: 'Daftar Agenda', icon: 'bi bi-list-task' },
      { path: '/admin/agenda-calendar', label: 'Kalender Agenda', icon: 'bi bi-calendar3' },
      { path: '/admin/agenda-categories', label: 'Kategori Agenda', icon: 'bi bi-tags' },
      { path: '/admin/agenda-reports', label: 'Laporan Agenda', icon: 'bi bi-file-text' },
      { path: '/admin/agenda-by-teacher', label: 'Agenda Per Guru', icon: 'bi bi-person' },
      { path: '/admin/agenda-by-class', label: 'Agenda Per Kelas', icon: 'bi bi-grid' }
    ]
  }
])

// System menu items
const systemMenuItems = computed(() => [
  {
    path: '/admin/settings',
    label: 'Settings',
    icon: 'bi bi-gear'
  },
  {
    path: '/admin/logs',
    label: 'Activity Logs',
    icon: 'bi bi-clock-history'
  },
  {
    path: '/admin/backups',
    label: 'Backups',
    icon: 'bi bi-database'
  },
  {
    path: '/admin/notifications',
    label: 'Notifications',
    icon: 'bi bi-bell'
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
.admin-sidebar {
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

.admin-sidebar.open {
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
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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
  padding: 12px 20px 6px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.sidebar-nav .nav-item {
  margin-bottom: 1px;
  padding: 0 12px;
}

.sidebar-nav .nav-link {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.85rem;
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
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.sidebar-nav .nav-link i {
  font-size: 16px;
  width: 20px;
  margin-right: 10px;
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
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(185, 28, 28, 0.2) 100%);
  color: white;
  font-weight: 600;
}

.sidebar-nav .nav-link.active::before {
  transform: scaleY(1);
}

.sidebar-nav .nav-link.active:hover {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(185, 28, 28, 0.3) 100%);
}

/* Nav Group Styles */
.nav-group {
  padding: 0 12px;
  margin-bottom: 2px;
}

.nav-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.85rem;
}

.nav-group-header:hover {
  color: rgba(255, 255, 255, 1);
}

.group-header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-header-content i {
  font-size: 16px;
  width: 20px;
  flex-shrink: 0;
}

.toggle-icon {
  font-size: 12px;
  transition: transform 0.2s ease;
  opacity: 0.6;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.nav-group-items {
  list-style: none;
  padding: 0;
  margin: 0 0 4px 0;
  overflow: hidden;
}

.nav-group-item {
  margin-bottom: 1px;
}

.nav-group-item .nav-link {
  padding: 8px 12px 8px 36px;
  font-size: 0.85rem;
}

.nav-group-item .nav-link i {
  font-size: 14px;
  width: 18px;
  margin-right: 8px;
}

.nav-group-item .nav-link.active::before {
  display: none;
}

/* Collapse Transition */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
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
  border-color: rgba(220, 38, 38, 0.3);
  transform: translateY(-2px);
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
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
  .admin-sidebar.open {
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
