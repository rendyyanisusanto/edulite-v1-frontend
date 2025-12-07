<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Laporan Prestasi</h4>
        <p class="text-muted mb-0">Statistik dan laporan lengkap prestasi sekolah</p>
      </div>
      <div class="d-flex gap-2">
        <select v-model="selectedYear" class="form-select" style="width: 150px">
          <option value="">Semua Tahun</option>
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Statistics Cards -->
      <div class="row mb-4">
        <!-- Total Prestasi -->
        <div class="col-md-3 mb-3">
          <div class="stat-card border-primary">
            <div class="stat-icon bg-primary bg-opacity-10">
              <i class="bi bi-trophy-fill text-primary"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">Total Prestasi</div>
            </div>
          </div>
        </div>

        <!-- Total Peserta -->
        <div class="col-md-3 mb-3">
          <div class="stat-card border-success">
            <div class="stat-icon bg-success bg-opacity-10">
              <i class="bi bi-people-fill text-success"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.participants.total }}</div>
              <div class="stat-label">Total Peserta</div>
              <div class="stat-detail">
                {{ statistics.participants.students }} Siswa, 
                {{ statistics.participants.teachers }} Guru
              </div>
            </div>
          </div>
        </div>

        <!-- Total Hasil -->
        <div class="col-md-3 mb-3">
          <div class="stat-card border-info">
            <div class="stat-icon bg-info bg-opacity-10">
              <i class="bi bi-award-fill text-info"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.results.total }}</div>
              <div class="stat-label">Total Hasil</div>
              <div class="stat-detail">
                {{ statistics.results.withCertificate }} dengan Sertifikat
              </div>
            </div>
          </div>
        </div>

        <!-- Tingkat Tertinggi -->
        <div class="col-md-3 mb-3">
          <div class="stat-card border-warning">
            <div class="stat-icon bg-warning bg-opacity-10">
              <i class="bi bi-star-fill text-warning"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ topLevel.count }}</div>
              <div class="stat-label">{{ topLevel.name }}</div>
              <div class="stat-detail">Tingkat Terbanyak</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row mb-4">
        <!-- Prestasi per Tingkat -->
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Prestasi per Tingkat</h6>
            </div>
            <div class="card-body">
              <div v-if="Object.keys(statistics.byLevel).length === 0" class="text-center text-muted py-4">
                Tidak ada data
              </div>
              <div v-else class="chart-container">
                <div
                  v-for="(count, level) in statistics.byLevel"
                  :key="level"
                  class="chart-bar-item"
                  v-show="count > 0"
                >
                  <div class="chart-label">{{ level }}</div>
                  <div class="chart-bar-wrapper">
                    <div
                      class="chart-bar"
                      :style="{ width: getBarWidth(count, maxByLevel) + '%' }"
                    >
                      <span class="chart-value">{{ count }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Prestasi per Jenis Event -->
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Prestasi per Jenis Event</h6>
            </div>
            <div class="card-body">
              <div v-if="Object.keys(statistics.byEventType).length === 0" class="text-center text-muted py-4">
                Tidak ada data
              </div>
              <div v-else class="chart-container">
                <div
                  v-for="(count, type) in statistics.byEventType"
                  :key="type"
                  class="chart-bar-item"
                  v-show="count > 0"
                >
                  <div class="chart-label">{{ type }}</div>
                  <div class="chart-bar-wrapper">
                    <div
                      class="chart-bar bg-success"
                      :style="{ width: getBarWidth(count, maxByEventType) + '%' }"
                    >
                      <span class="chart-value">{{ count }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Prestasi per Tahun -->
      <div class="row mb-4" v-if="!selectedYear && Object.keys(statistics.byYear).length > 0">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Prestasi per Tahun</h6>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <div
                  v-for="(count, year) in statistics.byYear"
                  :key="year"
                  class="chart-bar-item"
                >
                  <div class="chart-label">{{ year }}</div>
                  <div class="chart-bar-wrapper">
                    <div
                      class="chart-bar bg-info"
                      :style="{ width: getBarWidth(count, maxByYear) + '%' }"
                    >
                      <span class="chart-value">{{ count }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top 10 Prestasi -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0">Top 10 Prestasi (Berdasarkan Jumlah Peserta)</h6>
            </div>
            <div class="card-body">
              <div v-if="statistics.topAchievements.length === 0" class="text-center text-muted py-4">
                Tidak ada data
              </div>
              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th style="width: 50px">#</th>
                      <th>Judul Prestasi</th>
                      <th style="width: 150px">Tingkat</th>
                      <th style="width: 150px">Jenis Event</th>
                      <th style="width: 130px">Tanggal</th>
                      <th style="width: 100px" class="text-center">Peserta</th>
                      <th style="width: 100px" class="text-center">Hasil</th>
                      <th style="width: 100px" class="text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(achievement, index) in statistics.topAchievements" :key="achievement.id">
                      <td>{{ index + 1 }}</td>
                      <td>{{ achievement.title }}</td>
                      <td>
                        <span class="badge bg-primary">{{ achievement.level }}</span>
                      </td>
                      <td>
                        <span class="badge bg-info">{{ achievement.event_type }}</span>
                      </td>
                      <td>{{ formatDate(achievement.event_date) }}</td>
                      <td class="text-center">
                        <span class="badge bg-success">{{ achievement.participantCount }}</span>
                      </td>
                      <td class="text-center">
                        <span class="badge bg-warning text-dark">{{ achievement.resultCount }}</span>
                      </td>
                      <td class="text-center">
                        <button
                          @click="goToDetail(achievement.id)"
                          class="btn btn-sm btn-outline-primary"
                          title="Lihat Detail"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import achievementsService from "../services/achievementsService";

const router = useRouter();

// State
const loading = ref(true);
const selectedYear = ref("");
const statistics = ref({
  total: 0,
  byLevel: {},
  byEventType: {},
  byMonth: {},
  byYear: {},
  participants: {
    total: 0,
    students: 0,
    teachers: 0,
  },
  results: {
    total: 0,
    withCertificate: 0,
  },
  topAchievements: [],
});

// Computed
const availableYears = computed(() => {
  const years = Object.keys(statistics.value.byYear).map(Number);
  return years.sort((a, b) => b - a);
});

const topLevel = computed(() => {
  const byLevel = statistics.value.byLevel;
  let maxLevel = { name: "-", count: 0 };
  
  for (const [level, count] of Object.entries(byLevel)) {
    if (count > maxLevel.count) {
      maxLevel = { name: level, count };
    }
  }
  
  return maxLevel;
});

const maxByLevel = computed(() => {
  return Math.max(...Object.values(statistics.value.byLevel), 1);
});

const maxByEventType = computed(() => {
  return Math.max(...Object.values(statistics.value.byEventType), 1);
});

const maxByYear = computed(() => {
  return Math.max(...Object.values(statistics.value.byYear), 1);
});

// Methods
const fetchStatistics = async () => {
  try {
    loading.value = true;
    const params = {};
    if (selectedYear.value) {
      params.year = selectedYear.value;
    }
    
    const response = await achievementsService.getStatistics(params);
    statistics.value = response.data;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    alert("Gagal memuat statistik prestasi");
  } finally {
    loading.value = false;
  }
};

const getBarWidth = (value, max) => {
  if (max === 0) return 0;
  return Math.max((value / max) * 100, 5); // Minimum 5% untuk visibility
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const goToDetail = (id) => {
  router.push(`/admin/achievements/${id}`);
};

// Watch year change
watch(selectedYear, () => {
  fetchStatistics();
});

// Lifecycle
onMounted(() => {
  fetchStatistics();
});
</script>

<style scoped>
/* Statistics Cards */
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid;
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
  color: #2c3e50;
}

.stat-label {
  font-size: 14px;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 4px;
}

.stat-detail {
  font-size: 12px;
  color: #95a5a6;
}

/* Chart Styles */
.chart-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-label {
  width: 120px;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  flex-shrink: 0;
}

.chart-bar-wrapper {
  flex: 1;
  background: #f8f9fa;
  border-radius: 6px;
  height: 32px;
  position: relative;
}

.chart-bar {
  background: linear-gradient(90deg, #0d6efd 0%, #0a58ca 100%);
  height: 100%;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
  transition: width 0.6s ease;
  min-width: 40px;
}

.chart-bar.bg-success {
  background: linear-gradient(90deg, #198754 0%, #157347 100%);
}

.chart-bar.bg-info {
  background: linear-gradient(90deg, #0dcaf0 0%, #0aa2c0 100%);
}

.chart-value {
  color: white;
  font-weight: 700;
  font-size: 13px;
}

/* Card Styles */
.card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.card-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 20px;
  border-radius: 12px 12px 0 0 !important;
}

/* Table Styles */
.table {
  margin-bottom: 0;
}

.table thead th {
  background: #f8f9fa;
  font-weight: 600;
  font-size: 13px;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  padding: 12px;
}

.table tbody td {
  vertical-align: middle;
  padding: 12px;
  font-size: 14px;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

/* Badge Styles */
.badge {
  padding: 6px 12px;
  font-weight: 500;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .chart-label {
    width: 100px;
    font-size: 12px;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>
