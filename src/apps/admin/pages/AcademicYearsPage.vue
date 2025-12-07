<template>
  <div class="academic-years-page">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="mb-1">
            <i class="bi bi-calendar-range me-2"></i>
            Tahun Akademik
          </h2>
          <p class="text-muted mb-0">Kelola tahun akademik sekolah</p>
        </div>
        <button class="btn btn-danger" @click="openCreateModal">
          <i class="bi bi-plus-circle me-2"></i>
          Tambah Tahun Akademik
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
              placeholder="Cari tahun akademik..."
            >
          </div>
          <div class="col-md-3">
            <select v-model="filterActive" class="form-select">
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Tidak Aktif</option>
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
                <th>#</th>
                <th>Nama Tahun Akademik</th>
                <th>Tanggal Mulai</th>
                <th>Tanggal Selesai</th>
                <th>Status</th>
                <th>Dibuat</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredData.length === 0">
                <td colspan="7" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                  Tidak ada data tahun akademik
                </td>
              </tr>
              <tr v-for="(item, index) in paginatedData" :key="item.id">
                <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
                <td>
                  <strong>{{ item.name }}</strong>
                </td>
                <td>{{ formatDate(item.start_date) }}</td>
                <td>{{ formatDate(item.end_date) }}</td>
                <td>
                  <span 
                    class="badge" 
                    :class="item.is_active ? 'bg-success' : 'bg-secondary'"
                  >
                    {{ item.is_active ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </td>
                <td>{{ formatDate(item.created_at) }}</td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button 
                      v-if="!item.is_active"
                      class="btn btn-outline-success"
                      @click="setActive(item.id)"
                      title="Aktifkan"
                    >
                      <i class="bi bi-check-circle"></i>
                    </button>
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
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
          <div class="text-muted">
            Menampilkan {{ (currentPage - 1) * perPage + 1 }} - 
            {{ Math.min(currentPage * perPage, filteredData.length) }} dari 
            {{ filteredData.length }} data
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage--">
                  Previous
                </a>
              </li>
              <li 
                v-for="page in totalPages" 
                :key="page"
                class="page-item" 
                :class="{ active: currentPage === page }"
              >
                <a class="page-link" href="#" @click.prevent="currentPage = page">
                  {{ page }}
                </a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="currentPage++">
                  Next
                </a>
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
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditMode ? 'Edit Tahun Akademik' : 'Tambah Tahun Akademik' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <div class="mb-3">
                <label class="form-label">Nama Tahun Akademik <span class="text-danger">*</span></label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  placeholder="e.g., 2024/2025"
                  required
                >
                <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Tanggal Mulai <span class="text-danger">*</span></label>
                  <input 
                    v-model="form.start_date" 
                    type="date" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.start_date }"
                    required
                  >
                  <div v-if="errors.start_date" class="invalid-feedback">{{ errors.start_date }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tanggal Selesai <span class="text-danger">*</span></label>
                  <input 
                    v-model="form.end_date" 
                    type="date" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.end_date }"
                    required
                  >
                  <div v-if="errors.end_date" class="invalid-feedback">{{ errors.end_date }}</div>
                </div>
              </div>

              <div class="mb-3">
                <div class="form-check form-switch">
                  <input 
                    v-model="form.is_active" 
                    class="form-check-input" 
                    type="checkbox" 
                    id="isActiveSwitch"
                  >
                  <label class="form-check-label" for="isActiveSwitch">
                    Tahun Akademik Aktif
                  </label>
                </div>
                <small class="text-muted">
                  Hanya satu tahun akademik yang dapat aktif
                </small>
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
import { ref, computed, onMounted } from 'vue'
import academicYearsService from '../services/academicYearsService'
import { formatDate } from '../../../shared/utils/helpers'
import { useAuthStore } from '../../auth/store/authStore'

const authStore = useAuthStore()

// Data
const academicYears = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterActive = ref('')

// Pagination
const currentPage = ref(1)
const perPage = ref(10)

// Modal
const showModal = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const formError = ref('')

// Form
const form = ref({
  id: null,
  name: '',
  start_date: '',
  end_date: '',
  is_active: false,
  school_id: null
})

const errors = ref({})

// Computed
const filteredData = computed(() => {
  let data = academicYears.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(item => 
      item.name.toLowerCase().includes(query)
    )
  }

  // Active filter
  if (filterActive.value !== '') {
    const isActive = filterActive.value === 'true'
    data = data.filter(item => item.is_active === isActive)
  }

  return data
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredData.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / perPage.value)
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    const schoolId = authStore.user?.school_id
    const response = await academicYearsService.getAll(schoolId)
    // Handle different response structures
    academicYears.value = Array.isArray(response) ? response : (response.data || [])
  } catch (error) {
    console.error('Failed to load academic years:', error)
    academicYears.value = []
    alert('Gagal memuat data: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterActive.value = ''
  currentPage.value = 1
}

const openCreateModal = () => {
  isEditMode.value = false
  form.value = {
    id: null,
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
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
    start_date: item.start_date,
    end_date: item.end_date,
    is_active: item.is_active,
    school_id: item.school_id
  }
  errors.value = {}
  formError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = {
    id: null,
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
    school_id: null
  }
  errors.value = {}
  formError.value = ''
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.name) {
    errors.value.name = 'Nama tahun akademik wajib diisi'
  }

  if (!form.value.start_date) {
    errors.value.start_date = 'Tanggal mulai wajib diisi'
  }

  if (!form.value.end_date) {
    errors.value.end_date = 'Tanggal selesai wajib diisi'
  }

  if (form.value.start_date && form.value.end_date) {
    if (new Date(form.value.start_date) >= new Date(form.value.end_date)) {
      errors.value.end_date = 'Tanggal selesai harus lebih besar dari tanggal mulai'
    }
  }

  return Object.keys(errors.value).length === 0
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true
  formError.value = ''

  try {
    if (isEditMode.value) {
      await academicYearsService.update(form.value.id, form.value)
    } else {
      await academicYearsService.create(form.value)
    }

    await loadData()
    closeModal()
  } catch (error) {
    console.error('Failed to save academic year:', error)
    formError.value = error.message || 'Gagal menyimpan data'
  } finally {
    submitting.value = false
  }
}

const setActive = async (id) => {
  if (!confirm('Aktifkan tahun akademik ini? Tahun akademik lain akan dinonaktifkan.')) {
    return
  }

  try {
    await academicYearsService.setActive(id)
    await loadData()
  } catch (error) {
    console.error('Failed to set active:', error)
    alert('Gagal mengaktifkan: ' + error.message)
  }
}

const confirmDelete = async (item) => {
  if (!confirm(`Hapus tahun akademik "${item.name}"? Data tidak dapat dikembalikan.`)) {
    return
  }

  try {
    await academicYearsService.delete(item.id)
    await loadData()
  } catch (error) {
    console.error('Failed to delete academic year:', error)
    alert('Gagal menghapus: ' + error.message)
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.academic-years-page {
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

.badge {
  padding: 6px 12px;
  font-weight: 500;
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

.form-check-input:checked {
  background-color: #dc2626;
  border-color: #dc2626;
}

.pagination .page-link {
  color: #dc2626;
}

.pagination .page-item.active .page-link {
  background-color: #dc2626;
  border-color: #dc2626;
}
</style>
