<template>
  <div class="grades-page">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="mb-1">
            <i class="bi bi-mortarboard me-2"></i>
            Tingkat Kelas
          </h2>
          <p class="text-muted mb-0">Kelola tingkat kelas sekolah</p>
        </div>
        <button class="btn btn-danger" @click="openCreateModal">
          <i class="bi bi-plus-circle me-2"></i>
          Tambah Tingkat
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control" 
              placeholder="Cari tingkat kelas..."
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
                <th>Level</th>
                <th>Nama Tingkat</th>
                <th>Dibuat</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredData.length === 0">
                <td colspan="4" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                  Tidak ada data tingkat kelas
                </td>
              </tr>
              <tr v-for="item in paginatedData" :key="item.id">
                <td>
                  <span class="badge bg-primary">{{ item.level }}</span>
                </td>
                <td><strong>{{ item.name }}</strong></td>
                <td>{{ formatDate(item.created_at) }}</td>
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
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
          <div class="text-muted">
            Menampilkan {{ (currentPage - 1) * perPage + 1 }} - 
            {{ Math.min(currentPage * perPage, filteredData.length) }} dari 
            {{ filteredData.length }} data
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage--">Previous</a>
              </li>
              <li 
                v-for="page in totalPages" 
                :key="page"
                class="page-item" 
                :class="{ active: currentPage === page }"
              >
                <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
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
              {{ isEditMode ? 'Edit Tingkat Kelas' : 'Tambah Tingkat Kelas' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <div class="mb-3">
                <label class="form-label">Nama Tingkat <span class="text-danger">*</span></label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  placeholder="e.g., Grade 1, Grade 10"
                  required
                >
                <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Level <span class="text-danger">*</span></label>
                <input 
                  v-model.number="form.level" 
                  type="number" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.level }"
                  placeholder="e.g., 1, 2, 3..."
                  min="1"
                  required
                >
                <small class="text-muted">Untuk sorting urutan kelas</small>
                <div v-if="errors.level" class="invalid-feedback">{{ errors.level }}</div>
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
import gradesService from '../services/gradesService'
import { formatDate } from '../../../shared/utils/helpers'
import { useAuthStore } from '../../auth/store/authStore'

const authStore = useAuthStore()

// Data
const grades = ref([])
const loading = ref(false)
const searchQuery = ref('')

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
  level: 1,
  school_id: null
})

const errors = ref({})

// Computed
const filteredData = computed(() => {
  let data = grades.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.level.toString().includes(query)
    )
  }

  // Sort by level
  return data.sort((a, b) => a.level - b.level)
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
    const response = await gradesService.getAll(schoolId)
    // Handle different response structures
    grades.value = Array.isArray(response) ? response : (response.data || [])
  } catch (error) {
    console.error('Failed to load grades:', error)
    grades.value = []
    alert('Gagal memuat data: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const openCreateModal = () => {
  isEditMode.value = false
  form.value = {
    id: null,
    name: '',
    level: grades.value.length + 1,
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
    level: item.level,
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
    errors.value.name = 'Nama tingkat wajib diisi'
  }

  if (!form.value.level || form.value.level < 1) {
    errors.value.level = 'Level harus diisi dengan angka positif'
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
      await gradesService.update(form.value.id, form.value)
    } else {
      await gradesService.create(form.value)
    }

    await loadData()
    closeModal()
  } catch (error) {
    console.error('Failed to save grade:', error)
    formError.value = error.message || 'Gagal menyimpan data'
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (item) => {
  if (!confirm(`Hapus tingkat "${item.name}"? Data tidak dapat dikembalikan.`)) {
    return
  }

  try {
    await gradesService.delete(item.id)
    await loadData()
  } catch (error) {
    console.error('Failed to delete grade:', error)
    alert('Gagal menghapus: ' + error.message)
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.grades-page {
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
