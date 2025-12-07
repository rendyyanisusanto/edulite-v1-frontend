<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Laporan Buku Tamu</h4>
        <p class="text-muted mb-0">Statistik dan laporan kunjungan tamu</p>
      </div>
      <div class="d-flex gap-2">
        <select v-model="selectedMonth" class="form-select" style="width: 150px">
          <option value="">Semua Bulan</option>
          <option v-for="month in months" :key="month.value" :value="month.value">
            {{ month.label }}
          </option>
        </select>
        <select v-model="selectedYear" class="form-select" style="width: 120px">
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
        <div class="col-md-3 mb-3">
          <div class="stat-card border-primary">
            <div class="stat-icon bg-primary bg-opacity-10">
              <i class="bi bi-people-fill text-primary"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">Total Kunjungan</div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="stat-card border-success">
            <div class="stat-icon bg-success bg-opacity-10">
              <i class="bi bi-box-arrow-in-right text-success"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.checkedIn }}</div>
              <div class="stat-label">Sedang Check-in</div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="stat-card border-secondary">
            <div class="stat-icon bg-secondary bg-opacity-10">
              <i class="bi bi-box-arrow-right text-secondary"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.checkedOut }}</div>
              <div class="stat-label">Sudah Check-out</div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="stat-card border-info">
            <div class="stat-icon bg-info bg-opacity-10">
              <i class="bi bi-clock-fill text-info"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.averageVisitDuration }}</div>
              <div class="stat-label">Rata-rata (menit)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row mb-4">
        <!-- Kunjungan per Jenis Tamu -->
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Kunjungan per Jenis Tamu</h6>
            </div>
            <div class="card-body">
              <div v-if="Object.keys(statistics.byGuestType).length === 0" class="text-center text-muted py-4">
                Tidak ada data
              </div>
              <div v-else class="chart-container">
                <div
                  v-for="(count, type) in filteredByGuestType"
                  :key="type"
                  class="chart-bar-item"
                >
                  <div class="chart-label">{{ type }}</div>
                  <div class="chart-bar-wrapper">
                    <div
                      class="chart-bar"
                      :style="{ width: getBarWidth(count, maxByGuestType) + '%' }"
                    >
                      <span class="chart-value">{{ count }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kunjungan per Hari -->
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Kunjungan per Hari</h6>
            </div>
            <div class="card-body">
              <div v-if="Object.keys(statistics.byDay).length === 0" class="text-center text-muted py-4">
                Tidak ada data
              </div>
              <div v-else class="chart-container">
                <div
                  v-for="(count, day) in sortedByDay"
                  :key="day"
                  class="chart-bar-item"
                >
                  <div class="chart-label">{{ day }}</div>
                  <div class="chart-bar-wrapper">
                    <div
                      class="chart-bar bg-success"
                      :style="{ width: getBarWidth(count, maxByDay) + '%' }"
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

      <!-- Kunjungan per Bulan -->
      <div class="row mb-4" v-if="!selectedMonth && Object.keys(statistics.byMonth).length > 0">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Kunjungan per Bulan</h6>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <div
                  v-for="(count, month) in statistics.byMonth"
                  :key="month"
                  class="chart-bar-item"
                >
                  <div class="chart-label">{{ formatMonth(month) }}</div>
                  <div class="chart-bar-wrapper">
                    <div
                      class="chart-bar bg-info"
                      :style="{ width: getBarWidth(count, maxByMonth) + '%' }"
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

      <!-- Top 10 Tables -->
      <div class="row mb-4">
        <!-- Top Tujuan Kunjungan -->
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Top 10 Tujuan Kunjungan</h6>
            </div>
            <div class="card-body">
              <div v-if="Object.keys(statistics.topVisitPurposes).length === 0" class="text-center text-muted py-4">
                Tidak ada data
              </div>
              <div v-else class="table-responsive">
                <table class="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th style="width: 50px">#</th>
                      <th>Tujuan</th>
                      <th style="width: 100px" class="text-center">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="([purpose, count], index) in Object.entries(statistics.topVisitPurposes)" :key="purpose">
                      <td>{{ index + 1 }}</td>
                      <td>{{ purpose }}</td>
                      <td class="text-center">
                        <span class="badge bg-primary">{{ count }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Yang Dikunjungi -->
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Top 10 Yang Dikunjungi</h6>
            </div>
            <div class="card-body">
              <div v-if="Object.keys(statistics.topRelatedPersons).length === 0" class="text-center text-muted py-4">
                Tidak ada data
              </div>
              <div v-else class="table-responsive">
                <table class="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th style="width: 50px">#</th>
                      <th>Nama</th>
                      <th style="width: 100px" class="text-center">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="([person, count], index) in Object.entries(statistics.topRelatedPersons)" :key="person">
                      <td>{{ index + 1 }}</td>
                      <td>{{ person }}</td>
                      <td class="text-center">
                        <span class="badge bg-success">{{ count }}</span>
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
import { ref, computed, watch, onMounted } from "vue";
import guestbookService from "../services/guestbookService";

// State
const loading = ref(true);
const selectedYear = ref("");
const selectedMonth = ref("");
const statistics = ref({
  total: 0,
  checkedIn: 0,
  checkedOut: 0,
  byGuestType: {},
  byMonth: {},
  byDay: {},
  averageVisitDuration: 0,
  topVisitPurposes: {},
  topRelatedPersons: {},
});

// Months
const months = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

// Computed
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i);
  }
  return years;
});

const filteredByGuestType = computed(() => {
  const filtered = {};
  for (const [type, count] of Object.entries(statistics.value.byGuestType)) {
    if (count > 0) {
      filtered[type] = count;
    }
  }
  return filtered;
});

const sortedByDay = computed(() => {
  const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const sorted = {};
  dayOrder.forEach(day => {
    if (statistics.value.byDay[day]) {
      sorted[day] = statistics.value.byDay[day];
    }
  });
  return sorted;
});

const maxByGuestType = computed(() => {
  return Math.max(...Object.values(filteredByGuestType.value), 1);
});

const maxByDay = computed(() => {
  return Math.max(...Object.values(statistics.value.byDay), 1);
});

const maxByMonth = computed(() => {
  return Math.max(...Object.values(statistics.value.byMonth), 1);
});

// Methods
const fetchStatistics = async () => {
  try {
    loading.value = true;
    const params = {};
    if (selectedYear.value) params.year = selectedYear.value;
    if (selectedMonth.value) params.month = selectedMonth.value;

    const response = await guestbookService.getStatistics(params);
    statistics.value = response.data;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    alert("Gagal memuat statistik buku tamu");
  } finally {
    loading.value = false;
  }
};

const getBarWidth = (value, max) => {
  if (max === 0) return 0;
  return Math.max((value / max) * 100, 5);
};

const formatMonth = (monthStr) => {
  const [year, month] = monthStr.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

// Watch filters
watch([selectedYear, selectedMonth], () => {
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
  width: 100px;
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
  padding: 10px 12px;
  font-size: 13px;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.badge {
  padding: 4px 10px;
  font-weight: 500;
  font-size: 12px;
}
</style>
