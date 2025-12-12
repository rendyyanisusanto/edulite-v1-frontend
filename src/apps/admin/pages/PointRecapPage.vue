<template>
  <div class="point-recap-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h4 class="mb-1">Rekapitulasi Poin Siswa</h4>
        <p class="text-muted mb-0">Rekap poin pelanggaran dan reward per siswa</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="showCalculateModal = true">
          <i class="bi bi-calculator me-2"></i>Hitung Ulang Rekap
        </button>
        <button class="btn btn-success" @click="handleExport">
          <i class="bi bi-file-earmark-excel me-2"></i>Export Excel
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="stat-card stat-primary">
          <div class="stat-icon">
            <i class="bi bi-people"></i>
          </div>
          <div class="stat-content">
            <h3>{{ dashboardStats.overall?.total_students || 0 }}</h3>
            <p>Total Siswa</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card stat-success">
          <div class="stat-icon">
            <i class="bi bi-trophy"></i>
          </div>
          <div class="stat-content">
            <h3>{{ dashboardStats.overall?.students_with_positive || 0 }}</h3>
            <p>Poin Positif</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card stat-danger">
          <div class="stat-icon">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <h3>{{ dashboardStats.overall?.students_with_negative || 0 }}</h3>
            <p>Poin Negatif</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat-card stat-info">
          <div class="stat-icon">
            <i class="bi bi-graph-up"></i>
          </div>
          <div class="stat-content">
            <h3>{{ formatNumber(dashboardStats.overall?.avg_net_points) }}</h3>
            <p>Rata-rata Poin</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Tahun Ajaran</label>
            <select v-model="filters.academic_year_id" class="form-select" @change="loadData">
              <option value="">Pilih Tahun Ajaran</option>
              <option v-for="year in academicYears" :key="year.id" :value="year.id">
                {{ year.name }}
              </option>
            </select>
          </div>
            <div class="col-md-2">
            <label class="form-label">Tingkat</label>
            <select v-model="filters.grade_id" class="form-select" @change="loadData">
              <option value="">Semua Tingkat</option>
              <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                {{ grade.name }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Kelas</label>
            <select v-model="filters.class_id" class="form-select" @change="loadData">
              <option value="">Semua Kelas</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Limit</label>
            <select v-model="filters.limit" class="form-select" @change="loadData">
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">&nbsp;</label>
            <button class="btn btn-secondary w-100" @click="resetFilters">
              <i class="bi bi-arrow-clockwise"></i> Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'students' }" @click="activeTab = 'students'" href="#">
          <i class="bi bi-person me-2"></i>Per Siswa
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'classes' }" @click="activeTab = 'classes'" href="#">
          <i class="bi bi-door-open me-2"></i>Per Kelas
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'grades' }" @click="activeTab = 'grades'" href="#">
          <i class="bi bi-mortarboard me-2"></i>Per Tingkat
        </a>
      </li>
    </ul>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Student Recap Table -->
    <div v-else-if="activeTab === 'students'" class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>NIS</th>
                <th>Nama Siswa</th>
                <th>Kelas</th>
                <th>Pelanggaran</th>
                <th>Poin Pelanggaran</th>
                <th>Reward</th>
                <th>Poin Reward</th>
                <th>Poin Bersih</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="studentRecap.length === 0">
                <td colspan="11" class="text-center py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2 text-muted"></i>
                  <p class="mb-0">Belum ada data rekapitulasi</p>
                </td>
              </tr>
              <tr v-for="(item, index) in studentRecap" :key="item.id">
                <td>{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
                <td>{{ item.nis }}</td>
                <td>
                  <strong>{{ item.student_name }}</strong>
                </td>
                <td>{{ item.class_name }}</td>
                <td><span class="badge bg-warning text-dark">{{ item.total_violations }}</span></td>
                <td><span class="badge bg-danger">{{ item.total_violation_points }}</span></td>
                <td><span class="badge bg-info">{{ item.total_rewards }}</span></td>
                <td><span class="badge bg-success">{{ item.total_reward_points }}</span></td>
                <td><strong :class="getPointColor(item.net_points)">{{ item.net_points }}</strong></td>
                <td><span class="badge" :class="getPointCategoryBadge(item.point_category)">{{ item.point_category }}</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary" @click="showDetail(item)">
                    <i class="bi bi-eye"></i> Detail
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
          <div class="text-muted">Menampilkan {{ studentRecap.length }} dari {{ pagination.total }} data</div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                <button class="page-link" @click="changePage(pagination.page - 1)">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li 
                v-for="page in visiblePages" 
                :key="page" 
                class="page-item" 
                :class="{ active: pagination.page === page }"
              >
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
                <button class="page-link" @click="changePage(pagination.page + 1)">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Class Recap Table -->
    <div v-else-if="activeTab === 'classes'" class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Kelas</th>
                <th>Tingkat</th>
                <th>Total Siswa</th>
                <th>Total Pelanggaran</th>
                <th>Total Reward</th>
                <th>Rata-rata Poin</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="classRecap.length === 0">
                <td colspan="8" class="text-center py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2 text-muted"></i>
                  <p class="mb-0">Belum ada data rekapitulasi kelas</p>
                </td>
              </tr>
              <tr v-for="(item, index) in classRecap" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td><strong>{{ item.class_name }}</strong></td>
                <td>{{ item.grade_name }}</td>
                <td>{{ item.total_students }}</td>
                <td><span class="badge bg-danger">{{ item.total_violations }}</span></td>
                <td><span class="badge bg-success">{{ item.total_rewards }}</span></td>
                <td><strong :class="getPointColor(item.avg_net_points)">{{ formatNumber(item.avg_net_points) }}</strong></td>
                <td>
                  <span class="badge" :class="getPointCategoryBadge(item.avg_net_points > 0 ? 'POSITIVE' : item.avg_net_points < 0 ? 'NEGATIVE' : 'NEUTRAL')">
                    {{ item.avg_net_points > 0 ? 'POSITIVE' : item.avg_net_points < 0 ? 'NEGATIVE' : 'NEUTRAL' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Grade Recap Table -->
    <div v-else-if="activeTab === 'grades'" class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Tingkat</th>
                <th>Total Siswa</th>
                <th>Total Kelas</th>
                <th>Total Pelanggaran</th>
                <th>Total Reward</th>
                <th>Rata-rata Poin</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="gradeRecap.length === 0">
                <td colspan="8" class="text-center py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2 text-muted"></i>
                  <p class="mb-0">Belum ada data rekapitulasi tingkat</p>
                </td>
              </tr>
              <tr v-for="(item, index) in gradeRecap" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td><strong>{{ item.grade_name }}</strong></td>
                <td>{{ item.total_students }}</td>
                <td>{{ item.total_classes }}</td>
                <td><span class="badge bg-danger">{{ item.total_violations }}</span></td>
                <td><span class="badge bg-success">{{ item.total_rewards }}</span></td>
                <td><strong :class="getPointColor(item.avg_net_points)">{{ formatNumber(item.avg_net_points) }}</strong></td>
                <td>
                  <span class="badge" :class="getPointCategoryBadge(item.avg_net_points > 0 ? 'POSITIVE' : item.avg_net_points < 0 ? 'NEGATIVE' : 'NEUTRAL')">
                    {{ item.avg_net_points > 0 ? 'POSITIVE' : item.avg_net_points < 0 ? 'NEGATIVE' : 'NEUTRAL' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Calculate Modal -->
    <div class="modal fade" :class="{ show: showCalculateModal }" :style="{ display: showCalculateModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Hitung Ulang Rekapitulasi</h5>
            <button type="button" class="btn-close" @click="showCalculateModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Tahun Ajaran <span class="text-danger">*</span></label>
              <select v-model="calculateForm.academic_year_id" class="form-select" required>
                <option value="">Pilih Tahun Ajaran</option>
                <option v-for="year in academicYears" :key="year.id" :value="year.id">
                  {{ year.name }}
                </option>
              </select>
            </div>
              <div class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              Proses ini akan menghitung ulang rekapitulasi poin untuk semua siswa. Proses mungkin memakan waktu beberapa menit.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showCalculateModal = false">Batal</button>
            <button type="button" class="btn btn-primary" @click="handleCalculate" :disabled="calculating">
              <span v-if="calculating">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Menghitung...
              </span>
              <span v-else>
                <i class="bi bi-calculator me-2"></i>Hitung Sekarang
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showCalculateModal" class="modal-backdrop fade show"></div>

    <!-- Detail Modal -->
    <div class="modal fade" :class="{ show: showDetailModal }" :style="{ display: showDetailModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detail Poin Siswa</h5>
            <button type="button" class="btn-close" @click="showDetailModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="detailData">
              <!-- Student Info -->
              <div class="card mb-3">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <h6>Informasi Siswa</h6>
                      <table class="table table-sm table-borderless">
                        <tr>
                          <td width="120">NIS</td>
                          <td>: {{ detailData.recap.nis }}</td>
                        </tr>
                        <tr>
                          <td>Nama</td>
                          <td>: {{ detailData.recap.student_name }}</td>
                        </tr>
                        <tr>
                          <td>Kelas</td>
                          <td>: {{ detailData.recap.class_name }}</td>
                        </tr>
                      </table>
                    </div>
                    <div class="col-md-6">
                      <h6>Rekapitulasi Poin</h6>
                      <table class="table table-sm table-borderless">
                        <tr>
                          <td width="150">Pelanggaran</td>
                          <td>: {{ detailData.recap.total_violations }} ({{ detailData.recap.total_violation_points }} poin)</td>
                        </tr>
                        <tr>
                          <td>Reward</td>
                          <td>: {{ detailData.recap.total_rewards }} ({{ detailData.recap.total_reward_points }} poin)</td>
                        </tr>
                        <tr>
                          <td><strong>Poin Bersih</strong></td>
                          <td>: <strong :class="getPointColor(detailData.recap.net_points)">{{ detailData.recap.net_points }}</strong></td>
                        </tr>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Violations -->
              <div class="card mb-3">
                <div class="card-header">
                  <h6 class="mb-0">Daftar Pelanggaran</h6>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Tanggal</th>
                          <th>Jenis Pelanggaran</th>
                          <th>Level</th>
                          <th>Poin</th>
                          <th>Lokasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="detailData.violations.length === 0">
                          <td colspan="5" class="text-center">Tidak ada pelanggaran</td>
                        </tr>
                        <tr v-for="violation in detailData.violations" :key="violation.id">
                          <td>{{ formatDate(violation.date) }}</td>
                          <td>{{ violation.type_name }}</td>
                          <td><span class="badge bg-warning text-dark">{{ violation.level_name }}</span></td>
                          <td><span class="badge bg-danger">{{ violation.point }}</span></td>
                          <td>{{ violation.location }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Rewards -->
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">Daftar Reward</h6>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Tanggal</th>
                          <th>Jenis Reward</th>
                          <th>Level</th>
                          <th>Poin</th>
                          <th>Lokasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="detailData.rewards.length === 0">
                          <td colspan="5" class="text-center">Tidak ada reward</td>
                        </tr>
                        <tr v-for="reward in detailData.rewards" :key="reward.id">
                          <td>{{ formatDate(reward.date) }}</td>
                          <td>{{ reward.type_name }}</td>
                          <td><span class="badge bg-info">{{ reward.level_name }}</span></td>
                          <td><span class="badge bg-success">{{ reward.point }}</span></td>
                          <td>{{ reward.location }}</td>
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
    </div>
    <div v-if="showDetailModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import pointRecapService from '../services/pointRecapService';
import academicYearsService from '../services/academicYearsService';
import gradesService from '../services/gradesService';
import classesService from '../services/classesService';
import Swal from 'sweetalert2';

// State
const loading = ref(false);
const calculating = ref(false);
const activeTab = ref('students');
const studentRecap = ref([]);
const classRecap = ref([]);
const gradeRecap = ref([]);
const dashboardStats = ref({});
const academicYears = ref([]);
const grades = ref([]);
const classes = ref([]);
const showCalculateModal = ref(false);
const showDetailModal = ref(false);
const detailData = ref(null);

const filters = ref({
  academic_year_id: '',
  grade_id: '',
  class_id: '',
  limit: 50,
  page: 1
});

const calculateForm = ref({
  academic_year_id: ''
});

const pagination = ref({
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 1
});

// Computed
const visiblePages = computed(() => {
  const pages = [];
  const total = pagination.value.totalPages;
  const current = pagination.value.page;
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    }
  }
  
  return pages;
});

// Methods
const loadAcademicYears = async () => {
  try {
    const response = await academicYearsService.getAll();
    academicYears.value = response.data || [];
    
    // Auto-select first academic year if available and no year selected
    if (academicYears.value.length > 0 && !filters.value.academic_year_id) {
      filters.value.academic_year_id = academicYears.value[0].id;
      // Load data after auto-selecting
      await loadDashboardStats();
    }
  } catch (error) {
    console.error('Error loading academic years:', error);
    Swal.fire({
      icon: 'error',
      title: 'Gagal Memuat Data',
      text: 'Gagal memuat data tahun ajaran',
      confirmButtonColor: '#dc2626'
    });
  }
};

const loadGrades = async () => {
  try {
    const response = await gradesService.getAll();
    grades.value = response.data || [];
  } catch (error) {
    console.error('Error loading grades:', error);
  }
};

const loadClasses = async () => {
  try {
    const response = await classesService.getAll();
    classes.value = response.data || [];
  } catch (error) {
    console.error('Error loading classes:', error);
  }
};

const loadData = async () => {
  if (!filters.value.academic_year_id) {
    // Don't show alert on initial load, just return
    return;
  }

  loading.value = true;
  try {
    if (activeTab.value === 'students') {
      const response = await pointRecapService.getStudentPointRecap(filters.value);
      studentRecap.value = response.data || [];
      pagination.value = response.pagination || {};
    } else if (activeTab.value === 'classes') {
      const response = await pointRecapService.getClassPointRecap(filters.value);
      classRecap.value = response.data || [];
    } else if (activeTab.value === 'grades') {
      const response = await pointRecapService.getGradePointRecap(filters.value);
      gradeRecap.value = response.data || [];
    }

    // Load dashboard stats
    await loadDashboardStats();
  } catch (error) {
    console.error('Error loading data:', error);
    Swal.fire({
      icon: 'error',
      title: 'Gagal Memuat Data',
      text: error.response?.data?.message || 'Gagal memuat data',
      confirmButtonColor: '#dc2626'
    });
  } finally {
    loading.value = false;
  }
};

const loadDashboardStats = async () => {
  if (!filters.value.academic_year_id) {
    return;
  }

  try {
    const statsResponse = await pointRecapService.getDashboardStats({
      academic_year_id: filters.value.academic_year_id
    });
    dashboardStats.value = statsResponse.data || {};
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
    // Don't show alert for stats errors, just log it
  }
};

const resetFilters = () => {
  filters.value = {
    academic_year_id: '',
    grade_id: '',
    class_id: '',
    limit: 50,
    page: 1
  };
  studentRecap.value = [];
  classRecap.value = [];
  gradeRecap.value = [];
  dashboardStats.value = {};
};

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    filters.value.page = page;
    loadData();
  }
};

const handleCalculate = async () => {
  if (!calculateForm.value.academic_year_id) {
    Swal.fire({
      icon: 'warning',
      title: 'Form Belum Lengkap',
      text: 'Silakan pilih tahun ajaran terlebih dahulu',
      confirmButtonColor: '#dc2626'
    });
    return;
  }

  const result = await Swal.fire({
    title: 'Konfirmasi Perhitungan Ulang',
    text: 'Apakah Anda yakin ingin menghitung ulang rekapitulasi?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hitung Ulang',
    cancelButtonText: 'Batal'
  });

  if (!result.isConfirmed) {
    return;
  }

  calculating.value = true;
  try {
    await pointRecapService.calculatePointRecap(calculateForm.value);
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Rekapitulasi berhasil dihitung',
      timer: 2000,
      showConfirmButton: false
    });
    showCalculateModal.value = false;
    loadData();
  } catch (error) {
    console.error('Error calculating recap:', error);
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menghitung',
      text: error.response?.data?.message || 'Gagal menghitung rekapitulasi',
      confirmButtonColor: '#dc2626'
    });
  } finally {
    calculating.value = false;
  }
};

const showDetail = async (item) => {
  try {
    const response = await pointRecapService.getStudentPointDetail(item.student_id, {
      academic_year_id: filters.value.academic_year_id
    });
    detailData.value = response.data;
    showDetailModal.value = true;
  } catch (error) {
    console.error('Error loading detail:', error);
    Swal.fire({
      icon: 'error',
      title: 'Gagal Memuat Detail',
      text: 'Gagal memuat detail siswa',
      confirmButtonColor: '#dc2626'
    });
  }
};

const handleExport = async () => {
  if (!filters.value.academic_year_id) {
    Swal.fire({
      icon: 'warning',
      title: 'Filter Belum Dipilih',
      text: 'Silakan pilih tahun ajaran terlebih dahulu',
      confirmButtonColor: '#dc2626'
    });
    return;
  }

  try {
    const response = await pointRecapService.exportPointRecap(filters.value);

    // Convert to CSV
    const csv = convertToCSV(response.data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rekapitulasi-poin-${Date.now()}.csv`;
    link.click();

    Swal.fire({
      icon: 'success',
      title: 'Export Berhasil',
      text: 'Data berhasil diekspor',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('Error exporting:', error);
    Swal.fire({
      icon: 'error',
      title: 'Export Gagal',
      text: 'Gagal mengekspor data',
      confirmButtonColor: '#dc2626'
    });
  }
};

const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

const getPointColor = (point) => {
  if (point > 0) return 'text-success';
  if (point < 0) return 'text-danger';
  return 'text-muted';
};

const getPointCategoryBadge = (category) => {
  if (category === 'POSITIVE') return 'bg-success';
  if (category === 'NEGATIVE') return 'bg-danger';
  return 'bg-secondary';
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID');
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return parseFloat(num).toFixed(2);
};

// Watch
watch(activeTab, () => {
  loadData();
});

// Lifecycle
onMounted(() => {
  loadAcademicYears();
  loadGrades();
  loadClasses();
});
</script>

<style scoped>
.point-recap-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.stat-primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-success .stat-icon {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
}

.stat-danger .stat-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info .stat-icon {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-content h3 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.stat-content p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.nav-tabs .nav-link {
  cursor: pointer;
}

.table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.modal.show {
  display: block;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  opacity: 0.5;
}

.modal {
  z-index: 1050;
}
</style>
