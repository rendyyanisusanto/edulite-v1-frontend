<template>
  <div class="classes-page">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="mb-1">
            <i class="bi bi-door-open me-2"></i>
            Kelas
          </h2>
          <p class="text-muted mb-0">Kelola kelas sekolah</p>
        </div>
        <button class="btn btn-danger" @click="openCreateModal">
          <i class="bi bi-plus-circle me-2"></i>
          Tambah Kelas
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control" 
              placeholder="Cari kelas..."
            >
          </div>
          <div class="col-md-3">
            <select v-model="filterGrade" class="form-select">
              <option value="">Semua Tingkat</option>
              <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                {{ grade.name }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="filterDepartment" class="form-select">
              <option value="">Semua Jurusan</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="bi bi-arrow-clockwise me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Data Table -->
    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Nama Kelas</th>
                <th>Tingkat</th>
                <th>Jurusan</th>
                <th>Kapasitas</th>
                <th>Wali Kelas</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="displayData.length === 0">
                <td colspan="6" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                  Tidak ada data kelas
                </td>
              </tr>
              <tr v-for="item in displayData" :key="item.id">
                <td><strong>{{ item.name }}</strong></td>
                <td>
                  <span class="badge bg-primary">
                    {{ getGradeName(item.grade_id) }}
                  </span>
                </td>
                <td>
                  <span v-if="item.department_id" class="badge bg-info">
                    {{ getDepartmentName(item.department_id) }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>{{ item.capacity || '-' }}</td>
                <td>
                  <span v-if="item.homeroom_teacher_id" class="text-muted">
                    Teacher ID: {{ item.homeroom_teacher_id }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button 
                      class="btn btn-outline-primary"
                      @click="openEditModal(item)"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger"
                      @click="confirmDelete(item)"
                      title="Hapus"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center mt-3">
          <div class="d-flex align-items-center gap-3">
            <div class="text-muted">
              Menampilkan {{ (currentPage - 1) * perPage + 1 }} - 
              {{ Math.min(currentPage * perPage, totalItems) }} dari 
              {{ totalItems }} data
            </div>
            <div class="d-flex align-items-center gap-2">
              <label class="text-muted mb-0" style="font-size: 0.9rem;">Per halaman:</label>
              <select 
                v-model.number="perPage" 
                class="form-select form-select-sm" 
                style="width: auto;"
                @change="changePerPage"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>
          <nav v-if="totalPages > 1">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: !hasPrevPage }">
                <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">Previous</a>
              </li>
              <li 
                v-for="page in totalPages" 
                :key="page"
                class="page-item" 
                :class="{ active: currentPage === page }"
              >
                <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: !hasNextPage }">
                <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div 
      class="modal fade" 
      :class="{ show: showModal }" 
      :style="{ display: showModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditMode ? 'Edit Kelas' : 'Tambah Kelas' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nama Kelas <span class="text-danger">*</span></label>
                  <input 
                    v-model="form.name" 
                    type="text" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.name }"
                    placeholder="e.g., 10 TKJ 1, 8A, 6B"
                    required
                  >
                  <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Tingkat <span class="text-danger">*</span></label>
                  <select 
                    v-model="form.grade_id" 
                    class="form-select"
                    :class="{ 'is-invalid': errors.grade_id }"
                    required
                  >
                    <option value="">Pilih Tingkat</option>
                    <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                      {{ grade.name }}
                    </option>
                  </select>
                  <div v-if="errors.grade_id" class="invalid-feedback">{{ errors.grade_id }}</div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Jurusan</label>
                  <select 
                    v-model="form.department_id" 
                    class="form-select"
                  >
                    <option value="">Tidak Ada (SD/SMP)</option>
                    <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                      {{ dept.name }} ({{ dept.code }})
                    </option>
                  </select>
                  <small class="text-muted">Kosongkan untuk SD/SMP</small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Kapasitas</label>
                  <input 
                    v-model.number="form.capacity" 
                    type="number" 
                    class="form-control"
                    placeholder="e.g., 30"
                    min="1"
                  >
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Wali Kelas (ID)</label>
                <input 
                  v-model.number="form.homeroom_teacher_id" 
                  type="number" 
                  class="form-control"
                  placeholder="Teacher ID"
                >
                <small class="text-muted">Kosongkan jika belum ada</small>
              </div>

              <div v-if="formError" class="alert alert-danger">
                {{ formError }}
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Batal
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="submitForm"
              :disabled="submitting"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEditMode ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div 
      v-if="showModal" 
      class="modal-backdrop fade show"
      @click="closeModal"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import classesService from '../services/classesService'
import gradesService from '../services/gradesService'
import departmentsService from '../services/departmentsService'
import { formatDate } from '../../../shared/utils/helpers'
import { useAuthStore } from '../../auth/store/authStore'

const authStore = useAuthStore()

// Data
const classes = ref([])
const grades = ref([])
const departments = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterGrade = ref('')
const filterDepartment = ref('')

// Pagination from API
const currentPage = ref(1)
const perPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)
const hasNextPage = ref(false)
const hasPrevPage = ref(false)

// Modal
const showModal = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const formError = ref('')

// Form
const form = ref({
  id: null,
  name: '',
  grade_id: '',
  department_id: '',
  homeroom_teacher_id: null,
  capacity: null,
  school_id: null
})

const errors = ref({})

// Computed - Apply client-side filters to paginated data from server
const displayData = computed(() => {
  let data = classes.value

  // Client-side search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(item => 
      item.name.toLowerCase().includes(query)
    )
  }

  // Client-side grade filter
  if (filterGrade.value) {
    data = data.filter(item => item.grade_id === filterGrade.value)
  }

  // Client-side department filter
  if (filterDepartment.value) {
    data = data.filter(item => item.department_id === filterDepartment.value)
  }

  return data
})

// Methods
const getGradeName = (gradeId) => {
  const grade = grades.value.find(g => g.id === gradeId)
  return grade ? grade.name : 'N/A'
}

const getDepartmentName = (deptId) => {
  const dept = departments.value.find(d => d.id === deptId)
  return dept ? `${dept.name} (${dept.code})` : 'N/A'
}

const loadData = async () => {
  loading.value = true
  try {
    const schoolId = authStore.user?.school_id || null
    
    // Load classes with pagination, grades, and departments in parallel
    const [classesRes, gradesRes, deptsRes] = await Promise.all([
      classesService.getAll({
        page: currentPage.value,
        limit: perPage.value,
        schoolId: schoolId
      }).catch(err => {
        console.error('Classes error:', err)
        return { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPrevPage: false } }
      }),
      gradesService.getAll(schoolId).catch(err => {
        console.error('Grades error:', err)
        return { data: [] }
      }),
      departmentsService.getAll(schoolId).catch(err => {
        console.error('Departments error:', err)
        return { data: [] }
      })
    ])
    
    // Handle paginated response from API
    if (classesRes.data && classesRes.pagination) {
      classes.value = classesRes.data
      totalItems.value = classesRes.pagination.total
      totalPages.value = classesRes.pagination.totalPages
      hasNextPage.value = classesRes.pagination.hasNextPage
      hasPrevPage.value = classesRes.pagination.hasPrevPage
    } else {
      // Fallback for old response format
      classes.value = Array.isArray(classesRes) ? classesRes : (classesRes.data || [])
      totalItems.value = classes.value.length
      totalPages.value = 1
    }
    
    grades.value = Array.isArray(gradesRes) ? gradesRes : (gradesRes.data || [])
    grades.value = grades.value.sort((a, b) => (a.level || 0) - (b.level || 0))
    departments.value = Array.isArray(deptsRes) ? deptsRes : (deptsRes.data || [])
  } catch (error) {
    console.error('Failed to load data:', error)
    alert('Gagal memuat data: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterGrade.value = ''
  filterDepartment.value = ''
  currentPage.value = 1
  loadData()
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadData()
}

const changePerPage = () => {
  currentPage.value = 1
  loadData()
}

const openCreateModal = () => {
  isEditMode.value = false
  form.value = {
    id: null,
    name: '',
    grade_id: '',
    department_id: '',
    homeroom_teacher_id: null,
    capacity: null,
    school_id: authStore.user?.school_id
  }
  errors.value = {}
  formError.value = ''
  showModal.value = true
}

const openEditModal = (item) => {
  isEditMode.value = true
  form.value = {
    id: item.id,
    name: item.name,
    grade_id: item.grade_id,
    department_id: item.department_id || '',
    homeroom_teacher_id: item.homeroom_teacher_id || null,
    capacity: item.capacity || null,
    school_id: item.school_id
  }
  errors.value = {}
  formError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.name) {
    errors.value.name = 'Nama kelas wajib diisi'
  }

  if (!form.value.grade_id) {
    errors.value.grade_id = 'Tingkat wajib dipilih'
  }

  return Object.keys(errors.value).length === 0
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true
  formError.value = ''

  // Convert empty strings to null
  const payload = {
    ...form.value,
    department_id: form.value.department_id || null,
    homeroom_teacher_id: form.value.homeroom_teacher_id || null,
    capacity: form.value.capacity || null
  }

  try {
    if (isEditMode.value) {
      await classesService.update(payload.id, payload)
    } else {
      await classesService.create(payload)
    }

    await loadData()
    closeModal()
  } catch (error) {
    console.error('Failed to save class:', error)
    formError.value = error.message || 'Gagal menyimpan data'
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (item) => {
  if (!confirm(`Hapus kelas "${item.name}"? Data tidak dapat dikembalikan.`)) {
    return
  }

  try {
    await classesService.delete(item.id)
    await loadData()
  } catch (error) {
    console.error('Failed to delete class:', error)
    alert('Gagal menghapus: ' + error.message)
  }
}

// Watch filters - untuk client-side filtering
// Catatan: Jika API mendukung filter di server, ubah loadData untuk mengirim filter ke API
watch([searchQuery, filterGrade, filterDepartment], () => {
  currentPage.value = 1
  // Untuk saat ini masih client-side filter
  // Jika API mendukung search/filter params, uncomment baris berikut:
  // loadData()
})

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.classes-page {
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

.page-header h2 {
  color: #dc2626;
  font-weight: 600;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  vertical-align: middle;
}

.btn-danger {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border: none;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  border-radius: 12px;
  border: none;
}

.modal-header {
  background-color: #dc2626;
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-header .btn-close {
  filter: brightness(0) invert(1);
}

.form-control:focus,
.form-select:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 0.25rem rgba(220, 38, 38, 0.25);
}

.pagination .page-link {
  color: #dc2626;
}

.pagination .page-item.active .page-link {
  background-color: #dc2626;
  border-color: #dc2626;
}
</style>
