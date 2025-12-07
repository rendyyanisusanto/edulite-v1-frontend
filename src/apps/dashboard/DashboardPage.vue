<template>
  <div class="dashboard-page">
    <!-- Welcome Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="welcome-card">
          <h2>Selamat Datang, {{ userName }}! 👋</h2>
          <p class="text-muted mb-0">Berikut adalah ringkasan aktivitas hari ini</p>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-xl-3" v-for="stat in statistics" :key="stat.title">
        <div class="stat-card" :class="stat.color">
          <div class="stat-icon">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.title }}</p>
            <small :class="stat.trend > 0 ? 'text-success' : 'text-danger'">
              <i :class="stat.trend > 0 ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
              {{ Math.abs(stat.trend) }}% dari bulan lalu
            </small>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Recent Activities -->
      <div class="col-12 col-lg-8">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Aktivitas Terbaru</h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Aktivitas</th>
                    <th>User</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="activity in recentActivities" :key="activity.id">
                    <td>
                      <small class="text-muted">{{ activity.time }}</small>
                    </td>
                    <td>{{ activity.activity }}</td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="user-avatar-sm me-2">
                          {{ getInitials(activity.user) }}
                        </div>
                        {{ activity.user }}
                      </div>
                    </td>
                    <td>
                      <span class="badge" :class="activity.statusClass">
                        {{ activity.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Notifications -->
      <div class="col-12 col-lg-4">
        <!-- Quick Actions -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button class="btn btn-primary" @click="goTo('/students')">
                <i class="bi bi-person-plus me-2"></i> Tambah Siswa Baru
              </button>
              <button class="btn btn-outline-primary" @click="goTo('/attendance')">
                <i class="bi bi-check2-square me-2"></i> Input Absensi
              </button>
              <button class="btn btn-outline-primary" @click="goTo('/grades')">
                <i class="bi bi-trophy me-2"></i> Input Nilai
              </button>
              <button class="btn btn-outline-primary" @click="goTo('/reports')">
                <i class="bi bi-file-earmark-text me-2"></i> Generate Laporan
              </button>
            </div>
          </div>
        </div>

        <!-- Upcoming Events -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Agenda Mendatang</h5>
          </div>
          <div class="card-body">
            <div class="event-list">
              <div 
                v-for="event in upcomingEvents" 
                :key="event.id"
                class="event-item"
              >
                <div class="event-date" :class="event.color">
                  <div class="date-day">{{ event.day }}</div>
                  <div class="date-month">{{ event.month }}</div>
                </div>
                <div class="event-details">
                  <h6 class="mb-1">{{ event.title }}</h6>
                  <small class="text-muted">
                    <i class="bi bi-clock me-1"></i>{{ event.time }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="row g-4 mt-2">
      <div class="col-12 col-lg-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Grafik Kehadiran Siswa</h5>
          </div>
          <div class="card-body">
            <div class="chart-placeholder">
              <i class="bi bi-bar-chart-line fs-1 text-muted"></i>
              <p class="text-muted">Chart akan ditampilkan di sini</p>
              <small class="text-muted">Gunakan library seperti Chart.js atau ApexCharts</small>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Performa Nilai Siswa</h5>
          </div>
          <div class="card-body">
            <div class="chart-placeholder">
              <i class="bi bi-pie-chart fs-1 text-muted"></i>
              <p class="text-muted">Chart akan ditampilkan di sini</p>
              <small class="text-muted">Gunakan library seperti Chart.js atau ApexCharts</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../auth/store/authStore'
import { getInitials } from '../../shared/utils/helpers'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => authStore.userName)

// Statistics data
const statistics = ref([
  {
    title: 'Total Siswa',
    value: '1,245',
    icon: 'bi bi-people-fill',
    color: 'stat-primary',
    trend: 12
  },
  {
    title: 'Total Guru',
    value: '87',
    icon: 'bi bi-person-badge-fill',
    color: 'stat-success',
    trend: 5
  },
  {
    title: 'Kelas Aktif',
    value: '42',
    icon: 'bi bi-building',
    color: 'stat-warning',
    trend: 8
  },
  {
    title: 'Kehadiran Hari Ini',
    value: '94%',
    icon: 'bi bi-check-circle-fill',
    color: 'stat-info',
    trend: -2
  }
])

// Recent activities
const recentActivities = ref([
  {
    id: 1,
    time: '10:30',
    activity: 'Input absensi kelas X-A',
    user: 'Budi Santoso',
    status: 'Selesai',
    statusClass: 'bg-success'
  },
  {
    id: 2,
    time: '09:15',
    activity: 'Update nilai ujian Matematika',
    user: 'Siti Aminah',
    status: 'Selesai',
    statusClass: 'bg-success'
  },
  {
    id: 3,
    time: '08:45',
    activity: 'Tambah siswa baru',
    user: 'Ahmad Hidayat',
    status: 'Proses',
    statusClass: 'bg-warning'
  },
  {
    id: 4,
    time: '08:20',
    activity: 'Generate laporan bulanan',
    user: 'Dewi Lestari',
    status: 'Selesai',
    statusClass: 'bg-success'
  },
  {
    id: 5,
    time: '07:55',
    activity: 'Update jadwal pelajaran',
    user: 'Rizki Pratama',
    status: 'Pending',
    statusClass: 'bg-secondary'
  }
])

// Upcoming events
const upcomingEvents = ref([
  {
    id: 1,
    day: '15',
    month: 'NOV',
    title: 'Ujian Tengah Semester',
    time: '08:00 - 12:00',
    color: 'event-primary'
  },
  {
    id: 2,
    day: '20',
    month: 'NOV',
    title: 'Rapat Guru',
    time: '14:00 - 16:00',
    color: 'event-warning'
  },
  {
    id: 3,
    day: '25',
    month: 'NOV',
    title: 'Pembagian Rapor',
    time: '10:00 - 14:00',
    color: 'event-success'
  }
])

const goTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.dashboard-page {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.welcome-card h2 {
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-primary .stat-icon {
  background-color: #e3f2fd;
  color: #1976d2;
}

.stat-success .stat-icon {
  background-color: #e8f5e9;
  color: #388e3c;
}

.stat-warning .stat-icon {
  background-color: #fff3e0;
  color: #f57c00;
}

.stat-info .stat-icon {
  background-color: #e1f5fe;
  color: #0288d1;
}

.stat-content h3 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-content p {
  color: #6c757d;
  margin-bottom: 5px;
  font-size: 14px;
}

.stat-content small {
  font-size: 12px;
}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-header {
  background-color: white;
  border-bottom: 1px solid #e9ecef;
  padding: 20px;
  border-radius: 15px 15px 0 0;
}

.user-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.event-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
  transition: background-color 0.3s ease;
}

.event-item:hover {
  background-color: #e9ecef;
}

.event-date {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.event-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.event-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.event-success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.date-day {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.date-month {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.event-details h6 {
  font-weight: 600;
  color: #333;
}

.chart-placeholder {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .welcome-card {
    padding: 20px;
  }
  
  .welcome-card h2 {
    font-size: 1.5rem;
  }
}
</style>
