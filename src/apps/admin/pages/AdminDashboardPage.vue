<template>
  <div class="admin-dashboard-page">
    <!-- Welcome Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="welcome-card-admin">
          <div class="welcome-content">
            <h2>Welcome Back, {{ userName }}! 🛡️</h2>
            <p class="mb-0">System overview and management</p>
          </div>
          <div class="welcome-actions">
            <button class="btn btn-light" @click="refreshData">
              <i class="bi bi-arrow-clockwise me-2"></i>Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-xl-3" v-for="stat in statistics" :key="stat.title">
        <div class="stat-card-admin" :class="stat.color">
          <div class="stat-header">
            <div class="stat-icon">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-trend" :class="stat.trend > 0 ? 'positive' : 'negative'">
              <i :class="stat.trend > 0 ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
              {{ Math.abs(stat.trend) }}%
            </div>
          </div>
          <div class="stat-body">
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.title }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Schools Overview -->
      <div class="col-12 col-lg-8">
        <div class="card admin-card">
          <div class="card-header">
            <h5 class="mb-0">Schools Overview</h5>
            <div class="card-header-actions">
              <button class="btn btn-sm btn-outline-primary">
                <i class="bi bi-download me-1"></i>Export
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>School Name</th>
                    <th>Location</th>
                    <th>Users</th>
                    <th>Status</th>
                    <th>License</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="school in schools" :key="school.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="school-avatar me-2">
                          {{ school.name.charAt(0) }}
                        </div>
                        <strong>{{ school.name }}</strong>
                      </div>
                    </td>
                    <td>{{ school.location }}</td>
                    <td>
                      <span class="badge bg-light text-dark">{{ school.users }}</span>
                    </td>
                    <td>
                      <span class="badge" :class="school.statusClass">
                        {{ school.status }}
                      </span>
                    </td>
                    <td>
                      <small :class="school.licenseExpiring ? 'text-danger' : 'text-muted'">
                        {{ school.license }}
                      </small>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" title="View">
                          <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary" title="Edit">
                          <i class="bi bi-pencil"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats & System Status -->
      <div class="col-12 col-lg-4">
        <!-- System Health -->
        <div class="card admin-card mb-4">
          <div class="card-header">
            <h5 class="mb-0">System Health</h5>
          </div>
          <div class="card-body">
            <div class="system-metric mb-3">
              <div class="d-flex justify-content-between mb-2">
                <span>CPU Usage</span>
                <strong>45%</strong>
              </div>
              <div class="progress" style="height: 8px">
                <div class="progress-bar bg-success" style="width: 45%"></div>
              </div>
            </div>
            <div class="system-metric mb-3">
              <div class="d-flex justify-content-between mb-2">
                <span>Memory</span>
                <strong>72%</strong>
              </div>
              <div class="progress" style="height: 8px">
                <div class="progress-bar bg-warning" style="width: 72%"></div>
              </div>
            </div>
            <div class="system-metric mb-3">
              <div class="d-flex justify-content-between mb-2">
                <span>Storage</span>
                <strong>58%</strong>
              </div>
              <div class="progress" style="height: 8px">
                <div class="progress-bar bg-info" style="width: 58%"></div>
              </div>
            </div>
            <div class="system-metric">
              <div class="d-flex justify-content-between mb-2">
                <span>Database</span>
                <strong>34%</strong>
              </div>
              <div class="progress" style="height: 8px">
                <div class="progress-bar bg-primary" style="width: 34%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="card admin-card">
          <div class="card-header">
            <h5 class="mb-0">Recent Activities</h5>
          </div>
          <div class="card-body">
            <div class="activity-list">
              <div 
                v-for="activity in recentActivities" 
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon" :class="activity.type">
                  <i :class="activity.icon"></i>
                </div>
                <div class="activity-details">
                  <p class="mb-1">{{ activity.action }}</p>
                  <small class="text-muted">{{ activity.time }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="row g-4 mt-2">
      <div class="col-12 col-lg-6">
        <div class="card admin-card">
          <div class="card-header">
            <h5 class="mb-0">User Growth</h5>
          </div>
          <div class="card-body">
            <div class="chart-placeholder">
              <i class="bi bi-graph-up fs-1 text-muted"></i>
              <p class="text-muted">Chart visualization here</p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <div class="card admin-card">
          <div class="card-header">
            <h5 class="mb-0">Revenue Overview</h5>
          </div>
          <div class="card-body">
            <div class="chart-placeholder">
              <i class="bi bi-bar-chart-line fs-1 text-muted"></i>
              <p class="text-muted">Chart visualization here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../auth/store/authStore'

const authStore = useAuthStore()
const userName = computed(() => authStore.userName)

const statistics = ref([
  {
    title: 'Total Schools',
    value: '142',
    icon: 'bi bi-buildings',
    color: 'stat-danger',
    trend: 15
  },
  {
    title: 'Total Users',
    value: '8,547',
    icon: 'bi bi-people',
    color: 'stat-success',
    trend: 22
  },
  {
    title: 'Active Licenses',
    value: '135',
    icon: 'bi bi-shield-check',
    color: 'stat-warning',
    trend: 8
  },
  {
    title: 'Monthly Revenue',
    value: '$45.2K',
    icon: 'bi bi-cash-stack',
    color: 'stat-info',
    trend: -3
  }
])

const schools = ref([
  {
    id: 1,
    name: 'SMA Negeri 1 Jakarta',
    location: 'Jakarta',
    users: 245,
    status: 'Active',
    statusClass: 'bg-success',
    license: 'Expires in 45 days',
    licenseExpiring: false
  },
  {
    id: 2,
    name: 'SMK Teknologi Bandung',
    location: 'Bandung',
    users: 189,
    status: 'Active',
    statusClass: 'bg-success',
    license: 'Expires in 3 days',
    licenseExpiring: true
  },
  {
    id: 3,
    name: 'SMP Islam Terpadu',
    location: 'Surabaya',
    users: 156,
    status: 'Active',
    statusClass: 'bg-success',
    license: 'Expires in 89 days',
    licenseExpiring: false
  },
  {
    id: 4,
    name: 'SD Harapan Bangsa',
    location: 'Medan',
    users: 98,
    status: 'Trial',
    statusClass: 'bg-warning',
    license: 'Trial - 7 days left',
    licenseExpiring: true
  },
  {
    id: 5,
    name: 'Pondok Pesantren Al-Amin',
    location: 'Yogyakarta',
    users: 312,
    status: 'Active',
    statusClass: 'bg-success',
    license: 'Expires in 120 days',
    licenseExpiring: false
  }
])

const recentActivities = ref([
  {
    id: 1,
    type: 'success',
    icon: 'bi bi-check-circle',
    action: 'New school registered',
    time: '5 min ago'
  },
  {
    id: 2,
    type: 'warning',
    icon: 'bi bi-exclamation-triangle',
    action: 'License expiring soon',
    time: '15 min ago'
  },
  {
    id: 3,
    type: 'info',
    icon: 'bi bi-info-circle',
    action: 'Backup completed',
    time: '1 hour ago'
  },
  {
    id: 4,
    type: 'danger',
    icon: 'bi bi-x-circle',
    action: 'Failed login detected',
    time: '2 hours ago'
  }
])

const refreshData = () => {
  console.log('Refreshing data...')
}
</script>

<style scoped>
.admin-dashboard-page {
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

.welcome-card-admin {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-card-admin h2 {
  font-weight: 700;
  margin-bottom: 8px;
}

.welcome-actions .btn {
  border-radius: 8px;
}

.stat-card-admin {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card-admin:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-danger .stat-icon {
  background-color: #fee2e2;
  color: #dc2626;
}

.stat-success .stat-icon {
  background-color: #dcfce7;
  color: #16a34a;
}

.stat-warning .stat-icon {
  background-color: #fef3c7;
  color: #f59e0b;
}

.stat-info .stat-icon {
  background-color: #dbeafe;
  color: #3b82f6;
}

.stat-trend {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.stat-trend.positive {
  background-color: #dcfce7;
  color: #16a34a;
}

.stat-trend.negative {
  background-color: #fee2e2;
  color: #dc2626;
}

.stat-body h3 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-body p {
  color: #6c757d;
  margin-bottom: 0;
  font-size: 14px;
}

.admin-card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.admin-card .card-header {
  background-color: white;
  border-bottom: 1px solid #e9ecef;
  padding: 20px;
  border-radius: 15px 15px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-actions {
  display: flex;
  gap: 8px;
}

.school-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.system-metric span {
  font-size: 0.9rem;
  color: #6c757d;
}

.system-metric strong {
  font-size: 0.9rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}

.activity-icon.success {
  background-color: #dcfce7;
  color: #16a34a;
}

.activity-icon.warning {
  background-color: #fef3c7;
  color: #f59e0b;
}

.activity-icon.info {
  background-color: #dbeafe;
  color: #3b82f6;
}

.activity-icon.danger {
  background-color: #fee2e2;
  color: #dc2626;
}

.activity-details p {
  font-size: 0.9rem;
  color: #333;
}

.chart-placeholder {
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .welcome-card-admin {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .stat-card-admin {
    margin-bottom: 15px;
  }
}
</style>
