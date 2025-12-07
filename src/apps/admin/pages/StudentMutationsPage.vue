<template>
  <div class="mutations-page">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="mb-1">
            <i class="bi bi-arrow-left-right me-2"></i>
            Mutasi Siswa
          </h2>
          <p class="text-muted mb-0">Kelola data mutasi siswa masuk dan keluar</p>
        </div>
        <button class="btn btn-danger" @click="openCreateModal">
          <i class="bi bi-plus-circle me-2"></i>
          Tambah Mutasi
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
              placeholder="Cari nama siswa, asal/tujuan sekolah..."
            >
          </div>
          <div class="col-md-2">
            <select v-model="filterType" class="form-select" @change="loadData">
              <option value="">Semua Tipe</option>
              <option value="MASUK">Masuk</option>
              <option value="KELUAR">Keluar</option>
            </select>
          </div>
          <div class="col-md-2">
            <input 
              v-model="filterDateFrom" 
              type="date" 
              class="form-control" 
              placeholder="Dari Tanggal"
              @change="applyDateFilter"
            >
          </div>
          <div class="col-md-2">
            <input 
              v-model="filterDateTo" 
              type="date" 
              class="form-control" 
              placeholder="Sampai Tanggal"
              @change="applyDateFilter"
            >
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="bi bi-arrow-clockwise me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card bg-success bg-opacity-10 border-success">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-success">
                <i class="bi bi-box-arrow-in-right"></i>
              </div>
              <div class="ms-3">
                <h6 class="text-muted mb-1">Siswa Masuk</h6>
                <h3 class="mb-0 text-success">{{ stats.masuk }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card bg-warning bg-opacity-10 border-warning">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="stat-icon bg-warning">
                <i class="bi bi-box-arrow-left"></i>
              </div>
              <div class="ms-3">
                <h6 class="text-muted mb-1">Siswa Keluar</h6>
                <h3 class="mb-0 text-warning">{{ stats.keluar }}</h3>
              </div>
            </div>
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
                <th>Tanggal</th>
                <th>Nama Siswa</th>
                <th>Tipe</th>
                <th>Asal/Tujuan Sekolah</th>
                <th>Alasan</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="displayData.length === 0">
                <td colspan="6" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                  Tidak ada data mutasi
                </td>
              </tr>
              <tr v-for="item in displayData" :key="item.id">
                <td>{{ formatDate(item.date) }}</td>
                <td>
                  <strong>{{ getStudentName(item.student_id) }}</strong>
                  <br>
                  <small class="text-muted">NIS: {{ getStudentNIS(item.student_id) }}</small>
                </td>
                <td>
                  <span 
                    class="badge" 
                    :class="item.type === 'MASUK' ? 'bg-success' : 'bg-warning'"
                  >
                    <i :class="item.type === 'MASUK' ? 'bi bi-box-arrow-in-right' : 'bi bi-box-arrow-left'"></i>
                    {{ item.type }}
                  </span>
                </td>
                <td>{{ item.from_school || '-' }}</td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 200px;" :title="item.reason">
                    {{ item.reason || '-' }}
                  </span>
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
              {{ isEditMode ? 'Edit Mutasi' : 'Tambah Mutasi Siswa' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Siswa <span class="text-danger">*</span></label>
                  <div class="searchable-select" :class="{ 'is-invalid': errors.student_id }">
                    <input
                      v-model="studentSearch"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.student_id }"
                      placeholder="Cari nama atau NIS siswa..."
                      @focus="showStudentDropdown = true"
                      @blur="handleStudentBlur"
                      autocomplete="off"
                    >
                    <div 
                      v-if="showStudentDropdown && filteredStudents.length > 0" 
                      class="dropdown-menu show w-100"
                      style="max-height: 250px; overflow-y: auto;"
                    >
                      <button
                        v-for="student in filteredStudents"
                        :key="student.id"
                        type="button"
                        class="dropdown-item"
                        @mousedown.prevent="selectStudent(student)"
                      >
                        <div class="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{{ student.name }}</strong>
                            <br>
                            <small class="text-muted">NIS: {{ student.nis }}</small>
                          </div>
                          <span class="badge bg-secondary">{{ getClassName(student.class_id) }}</span>
                        </div>
                      </button>
                    </div>
                    <div 
                      v-if="showStudentDropdown && filteredStudents.length === 0 && studentSearch" 
                      class="dropdown-menu show w-100"
                    >
                      <div class="dropdown-item text-muted">Siswa tidak ditemukan</div>
                    </div>
                  </div>
                  <div v-if="errors.student_id" class="invalid-feedback d-block">{{ errors.student_id }}</div>
                  <div v-if="selectedStudent" class="mt-2">
                    <div class="alert alert-info py-2 px-3 mb-0">
                      <i class="bi bi-check-circle me-2"></i>
                      <strong>{{ selectedStudent.name }}</strong> - NIS: {{ selectedStudent.nis }}
                      <button 
                        type="button" 
                        class="btn-close btn-close-sm float-end" 
                        @click="clearStudent"
                        style="font-size: 0.7rem;"
                      ></button>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Tipe Mutasi <span class="text-danger">*</span></label>
                  <select 
                    v-model="form.type" 
                    class="form-select"
                    :class="{ 'is-invalid': errors.type }"
                    required
                  >
                    <option value="">Pilih Tipe</option>
                    <option value="MASUK">Masuk</option>
                    <option value="KELUAR">Keluar</option>
                  </select>
                  <div v-if="errors.type" class="invalid-feedback">{{ errors.type }}</div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">
                    {{ form.type === 'MASUK' ? 'Asal Sekolah' : 'Tujuan Sekolah' }}
                    <span class="text-danger">*</span>
                  </label>
                  <input 
                    v-model="form.from_school" 
                    type="text" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.from_school }"
                    :placeholder="form.type === 'MASUK' ? 'Nama sekolah asal' : 'Nama sekolah tujuan'"
                    maxlength="200"
                    required
                  >
                  <div v-if="errors.from_school" class="invalid-feedback">{{ errors.from_school }}</div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Tanggal Mutasi <span class="text-danger">*</span></label>
                  <input 
                    v-model="form.date" 
                    type="date" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.date }"
                    required
                  >
                  <div v-if="errors.date" class="invalid-feedback">{{ errors.date }}</div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Alasan <span class="text-danger">*</span></label>
                <textarea 
                  v-model="form.reason" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.reason }"
                  rows="3"
                  placeholder="Alasan mutasi siswa"
                  required
                ></textarea>
                <div v-if="errors.reason" class="invalid-feedback">{{ errors.reason }}</div>
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
import studentMutationsService from '../services/studentMutationsService'
import studentsService from '../../../shared/services/studentsService'
import { useAuthStore } from '../../auth/store/authStore'

const authStore = useAuthStore()

// Data
const mutations = ref([])
const students = ref([])
const classes = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterType = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')

// Searchable Select for Student
const studentSearch = ref('')
const showStudentDropdown = ref(false)
const selectedStudent = ref(null)

// Pagination from API
const currentPage = ref(1)
const perPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)
const hasNextPage = ref(false)
const hasPrevPage = ref(false)

// Statistics
const stats = ref({
  masuk: 0,
  keluar: 0
})

// Modal
const showModal = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const formError = ref('')

// Form
const form = ref({
  id: null,
  student_id: '',
  school_id: null,
  type: '',
  from_school: '',
  reason: '',
  date: '',
  created_by: null
})

const errors = ref({})

// Computed
const displayData = computed(() => {
  let data = mutations.value

  // Client-side search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(item => {
      const studentName = getStudentName(item.student_id).toLowerCase()
      const fromSchool = (item.from_school || '').toLowerCase()
      return studentName.includes(query) || fromSchool.includes(query)
    })
  }

  return data
})

const filteredStudents = computed(() => {
  if (!studentSearch.value) {
    return students.value.slice(0, 50) // Show first 50 if no search
  }
  
  const query = studentSearch.value.toLowerCase()
  return students.value.filter(student => 
    student.name.toLowerCase().includes(query) ||
    student.nis.toLowerCase().includes(query) ||
    student.nisn?.toLowerCase().includes(query)
  ).slice(0, 50) // Limit to 50 results
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const getStudentName = (studentId) => {
  const student = students.value.find(s => s.id === studentId)
  return student ? student.name : 'Unknown'
}

const getStudentNIS = (studentId) => {
  const student = students.value.find(s => s.id === studentId)
  return student ? student.nis : '-'
}

const getClassName = (classId) => {
  const cls = classes.value.find(c => c.id === classId)
  return cls ? cls.name : '-'
}

const selectStudent = (student) => {
  form.value.student_id = student.id
  selectedStudent.value = student
  studentSearch.value = student.name
  showStudentDropdown.value = false
}

const clearStudent = () => {
  form.value.student_id = ''
  selectedStudent.value = null
  studentSearch.value = ''
}

const handleStudentBlur = () => {
  setTimeout(() => {
    showStudentDropdown.value = false
  }, 200)
}

const calculateStats = () => {
  stats.value = {
    masuk: mutations.value.filter(m => m.type === 'MASUK').length,
    keluar: mutations.value.filter(m => m.type === 'KELUAR').length
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const schoolId = authStore.user?.school_id || null
    
    const [mutationsRes, studentsRes, classesRes] = await Promise.all([
      studentMutationsService.getAll({
        page: currentPage.value,
        limit: perPage.value,
        schoolId: schoolId,
        type: filterType.value || null
      }),
      studentsService.getAll(schoolId).catch(err => {
        console.error('Students error:', err)
        return { data: [] }
      }),
      import('../services/classesService.js').then(m => m.default.getAll({ schoolId })).catch(err => {
        console.error('Classes error:', err)
        return { data: [] }
      })
    ])
    
    // Handle paginated response from API
    if (mutationsRes.data && mutationsRes.pagination) {
      mutations.value = mutationsRes.data
      totalItems.value = mutationsRes.pagination.total
      totalPages.value = mutationsRes.pagination.totalPages
      hasNextPage.value = mutationsRes.pagination.hasNextPage
      hasPrevPage.value = mutationsRes.pagination.hasPrevPage
    } else {
      mutations.value = Array.isArray(mutationsRes) ? mutationsRes : (mutationsRes.data || [])
      totalItems.value = mutations.value.length
      totalPages.value = 1
    }
    
    students.value = Array.isArray(studentsRes) ? studentsRes : (studentsRes.data || [])
    classes.value = Array.isArray(classesRes) ? classesRes : (classesRes.data || [])
    calculateStats()
  } catch (error) {
    console.error('Failed to load data:', error)
    alert('Gagal memuat data: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterType.value = ''
  filterDateFrom.value = ''
  filterDateTo.value = ''
  currentPage.value = 1
  loadData()
}

const applyDateFilter = () => {
  // Implement date filter logic if needed
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
  const today = new Date().toISOString().split('T')[0]
  form.value = {
    id: null,
    student_id: '',
    school_id: authStore.user?.school_id,
    type: '',
    from_school: '',
    reason: '',
    date: today,
    created_by: authStore.user?.id
  }
  studentSearch.value = ''
  selectedStudent.value = null
  showStudentDropdown.value = false
  errors.value = {}
  formError.value = ''
  showModal.value = true
}

const openEditModal = (item) => {
  isEditMode.value = true
  form.value = {
    id: item.id,
    student_id: item.student_id,
    school_id: item.school_id,
    type: item.type,
    from_school: item.from_school,
    reason: item.reason,
    date: item.date,
    created_by: item.created_by
  }
  
  // Set selected student for edit mode
  const student = students.value.find(s => s.id === item.student_id)
  if (student) {
    selectedStudent.value = student
    studentSearch.value = student.name
  }
  showStudentDropdown.value = false
  
  errors.value = {}
  formError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.student_id) {
    errors.value.student_id = 'Siswa wajib dipilih'
  }

  if (!form.value.type) {
    errors.value.type = 'Tipe mutasi wajib dipilih'
  }

  if (!form.value.from_school) {
    errors.value.from_school = 'Nama sekolah wajib diisi'
  }

  if (!form.value.date) {
    errors.value.date = 'Tanggal mutasi wajib diisi'
  }

  if (!form.value.reason) {
    errors.value.reason = 'Alasan wajib diisi'
  }

  return Object.keys(errors.value).length === 0
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true
  formError.value = ''

  const payload = {
    student_id: form.value.student_id,
    school_id: form.value.school_id,
    type: form.value.type,
    from_school: form.value.from_school,
    reason: form.value.reason,
    date: form.value.date,
    created_by: form.value.created_by
  }

  try {
    if (isEditMode.value) {
      await studentMutationsService.update(form.value.id, payload)
    } else {
      await studentMutationsService.create(payload)
    }

    await loadData()
    closeModal()
  } catch (error) {
    console.error('Failed to save mutation:', error)
    formError.value = error.response?.data?.message || error.message || 'Gagal menyimpan data'
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (item) => {
  const studentName = getStudentName(item.student_id)
  if (!confirm(`Hapus data mutasi siswa "${studentName}"? Data tidak dapat dikembalikan.`)) {
    return
  }

  try {
    await studentMutationsService.delete(item.id)
    await loadData()
  } catch (error) {
    console.error('Failed to delete mutation:', error)
    alert('Gagal menghapus: ' + (error.response?.data?.message || error.message))
  }
}

// Watch filters
watch([searchQuery], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.mutations-page {
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

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
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

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Searchable Select */
.searchable-select {
  position: relative;
}

.searchable-select .dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  margin-top: 2px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.searchable-select .dropdown-item {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.searchable-select .dropdown-item:last-child {
  border-bottom: none;
}

.searchable-select .dropdown-item:hover {
  background-color: #f8f9fa;
}

.searchable-select .dropdown-item:active {
  background-color: #e9ecef;
}

.searchable-select .dropdown-item strong {
  color: #212529;
  font-size: 0.95rem;
}

.searchable-select .dropdown-item small {
  font-size: 0.8rem;
}
</style>
