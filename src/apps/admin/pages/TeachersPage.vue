<template>
  <div class="teachers-page">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="mb-1">
            <i class="bi bi-person-badge me-2"></i>
            Guru
          </h2>
          <p class="text-muted mb-0">Kelola data guru</p>
        </div>
        <button class="btn btn-danger" @click="openCreateModal">
          <i class="bi bi-plus-circle me-2"></i>
          Tambah Guru
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
              placeholder="Cari NIP, nama, posisi, mata pelajaran..."
            >
          </div>
          <div class="col-md-3">
            <select v-model="filterPosition" class="form-select">
              <option value="">Semua Posisi</option>
              <option value="Guru Tetap">Guru Tetap</option>
              <option value="Guru Honorer">Guru Honorer</option>
              <option value="Guru Kontrak">Guru Kontrak</option>
              <option value="Kepala Sekolah">Kepala Sekolah</option>
              <option value="Wakil Kepala Sekolah">Wakil Kepala Sekolah</option>
            </select>
          </div>
          <div class="col-md-3">
            <select v-model="filterSubject" class="form-select">
              <option value="">Semua Mata Pelajaran</option>
              <option v-for="subject in uniqueSubjects" :key="subject" :value="subject">
                {{ subject }}
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
                <th>NIP</th>
                <th>Nama</th>
                <th>Posisi</th>
                <th>Mata Pelajaran</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="displayData.length === 0">
                <td colspan="5" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                  Tidak ada data guru
                </td>
              </tr>
              <tr v-for="item in displayData" :key="item.id">
                <td><strong>{{ item.nip }}</strong></td>
                <td>{{ item.name }}</td>
                <td>
                  <span class="badge bg-info">
                    {{ item.position }}
                  </span>
                </td>
                <td>{{ item.subject || '-' }}</td>
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
              {{ isEditMode ? 'Edit Guru' : 'Tambah Guru' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">NIP <span class="text-danger">*</span></label>
                  <input 
                    v-model="form.nip" 
                    type="text" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.nip }"
                    placeholder="Nomor Induk Pegawai"
                    maxlength="50"
                    required
                  >
                  <div v-if="errors.nip" class="invalid-feedback">{{ errors.nip }}</div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Nama Lengkap <span class="text-danger">*</span></label>
                  <input 
                    v-model="form.name" 
                    type="text" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.name }"
                    placeholder="Nama lengkap guru"
                    maxlength="100"
                    required
                  >
                  <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Posisi <span class="text-danger">*</span></label>
                  <select 
                    v-model="form.position" 
                    class="form-select"
                    :class="{ 'is-invalid': errors.position }"
                    required
                  >
                    <option value="">Pilih Posisi</option>
                    <option value="Guru Tetap">Guru Tetap</option>
                    <option value="Guru Honorer">Guru Honorer</option>
                    <option value="Guru Kontrak">Guru Kontrak</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Wakil Kepala Sekolah">Wakil Kepala Sekolah</option>
                    <option value="Guru BK">Guru BK</option>
                  </select>
                  <div v-if="errors.position" class="invalid-feedback">{{ errors.position }}</div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Mata Pelajaran</label>
                  <input 
                    v-model="form.subject" 
                    type="text" 
                    class="form-control"
                    placeholder="e.g., Matematika, Bahasa Indonesia"
                    maxlength="100"
                  >
                  <small class="text-muted">Kosongkan jika tidak mengajar</small>
                </div>
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
import teachersService from '../services/teachersService'
import { useAuthStore } from '../../auth/store/authStore'

const authStore = useAuthStore()

// Data
const teachers = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterPosition = ref('')
const filterSubject = ref('')

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
  nip: '',
  name: '',
  position: '',
  subject: '',
  school_id: null
})

const errors = ref({})

// Computed
const uniqueSubjects = computed(() => {
  const subjects = teachers.value
    .map(t => t.subject)
    .filter(s => s && s.trim() !== '')
  return [...new Set(subjects)].sort()
})

const displayData = computed(() => {
  let data = teachers.value

  // Client-side search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(item => 
      item.nip?.toLowerCase().includes(query) ||
      item.name?.toLowerCase().includes(query) ||
      item.position?.toLowerCase().includes(query) ||
      item.subject?.toLowerCase().includes(query)
    )
  }

  // Client-side position filter
  if (filterPosition.value) {
    data = data.filter(item => item.position === filterPosition.value)
  }

  // Client-side subject filter
  if (filterSubject.value) {
    data = data.filter(item => item.subject === filterSubject.value)
  }

  return data
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    const schoolId = authStore.user?.school_id || null
    
    const response = await teachersService.getAll({
      page: currentPage.value,
      limit: perPage.value,
      schoolId: schoolId
    })
    
    // Handle paginated response from API
    if (response.data && response.pagination) {
      teachers.value = response.data
      totalItems.value = response.pagination.total
      totalPages.value = response.pagination.totalPages
      hasNextPage.value = response.pagination.hasNextPage
      hasPrevPage.value = response.pagination.hasPrevPage
    } else {
      // Fallback for old response format
      teachers.value = Array.isArray(response) ? response : (response.data || [])
      totalItems.value = teachers.value.length
      totalPages.value = 1
    }
  } catch (error) {
    console.error('Failed to load teachers:', error)
    alert('Gagal memuat data: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterPosition.value = ''
  filterSubject.value = ''
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
    nip: '',
    name: '',
    position: '',
    subject: '',
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
    nip: item.nip,
    name: item.name,
    position: item.position,
    subject: item.subject || '',
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

  if (!form.value.nip) {
    errors.value.nip = 'NIP wajib diisi'
  }

  if (!form.value.name) {
    errors.value.name = 'Nama wajib diisi'
  }

  if (!form.value.position) {
    errors.value.position = 'Posisi wajib dipilih'
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
    nip: form.value.nip,
    name: form.value.name,
    position: form.value.position,
    subject: form.value.subject || null,
    school_id: form.value.school_id
  }

  try {
    if (isEditMode.value) {
      await teachersService.update(payload.id || form.value.id, payload)
    } else {
      await teachersService.create(payload)
    }

    await loadData()
    closeModal()
  } catch (error) {
    console.error('Failed to save teacher:', error)
    formError.value = error.response?.data?.message || error.message || 'Gagal menyimpan data'
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (item) => {
  if (!confirm(`Hapus data guru "${item.name}"? Data tidak dapat dikembalikan.`)) {
    return
  }

  try {
    await teachersService.delete(item.id)
    await loadData()
  } catch (error) {
    console.error('Failed to delete teacher:', error)
    alert('Gagal menghapus: ' + (error.response?.data?.message || error.message))
  }
}

// Watch filters - untuk client-side filtering
watch([searchQuery, filterPosition, filterSubject], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.teachers-page {
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
