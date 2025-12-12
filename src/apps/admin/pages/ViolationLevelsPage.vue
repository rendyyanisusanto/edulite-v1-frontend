<template>
  <div class="violation-levels-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h4 class="mb-1">Tingkat & Poin Pelanggaran</h4>
        <p class="text-muted mb-0">Kelola tingkat pelanggaran berdasarkan rentang poin</p>
      </div>
      <button class="btn btn-danger" @click="showCreateModal">
        <i class="bi bi-plus-circle me-2"></i>Tambah Tingkat
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Data Cards -->
    <div v-else class="row g-4">
      <div v-if="violationLevels.length === 0" class="col-12">
        <div class="card">
          <div class="card-body text-center py-5">
            <i class="bi bi-inbox fs-1 d-block mb-3 text-muted"></i>
            <p class="mb-0">Belum ada data tingkat pelanggaran</p>
            <button class="btn btn-danger mt-3" @click="showCreateModal">
              <i class="bi bi-plus-circle me-2"></i>Tambah Tingkat Pelanggaran
            </button>
          </div>
        </div>
      </div>

      <div v-for="level in violationLevels" :key="level.id" class="col-md-6 col-lg-4">
        <div class="card level-card" :class="getLevelCardClass(level.name)">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 class="mb-1">{{ level.name }}</h5>
                <p class="text-muted mb-0 small">{{ level.school?.name || 'Sekolah' }}</p>
              </div>
              <div class="dropdown">
                <button 
                  class="btn btn-sm btn-light" 
                  type="button" 
                  data-bs-toggle="dropdown"
                >
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="showEditModal(level)">
                      <i class="bi bi-pencil me-2"></i>Edit
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item text-danger" href="#" @click.prevent="confirmDelete(level)">
                      <i class="bi bi-trash me-2"></i>Hapus
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div class="point-range mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div class="text-center flex-fill">
                  <div class="point-label">Min Poin</div>
                  <div class="point-value">{{ level.min_point }}</div>
                </div>
                <div class="px-3">
                  <i class="bi bi-arrow-right fs-4"></i>
                </div>
                <div class="text-center flex-fill">
                  <div class="point-label">Max Poin</div>
                  <div class="point-value">{{ level.max_point }}</div>
                </div>
              </div>
            </div>

            <div class="description">
              <small class="text-muted">
                {{ level.description || 'Tidak ada deskripsi' }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="card mt-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div class="text-muted">
            Menampilkan {{ violationLevels.length }} dari {{ pagination.total }} data
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: !pagination.hasPrevPage }">
                <button class="page-link" @click="changePage(pagination.page - 1)">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li 
                v-for="page in visiblePages" 
                :key="page" 
                class="page-item" 
                :class="{ active: page === pagination.page }"
              >
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: !pagination.hasNextPage }">
                <button class="page-link" @click="changePage(pagination.page + 1)">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" ref="formModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditMode ? 'Edit Tingkat Pelanggaran' : 'Tambah Tingkat Pelanggaran' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Nama Tingkat <span class="text-danger">*</span></label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  class="form-control" 
                  placeholder="Misal: Ringan, Sedang, Berat"
                  required
                />
                <small class="text-muted">Contoh: Ringan, Sedang, Berat</small>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Min Poin <span class="text-danger">*</span></label>
                    <input 
                      v-model.number="form.min_point" 
                      type="number" 
                      class="form-control" 
                      placeholder="0"
                      required
                      min="0"
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Max Poin <span class="text-danger">*</span></label>
                    <input 
                      v-model.number="form.max_point" 
                      type="number" 
                      class="form-control" 
                      placeholder="100"
                      required
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Keterangan</label>
                <textarea 
                  v-model="form.description" 
                  class="form-control" 
                  rows="3"
                  placeholder="Deskripsi tingkat pelanggaran"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Batal
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="handleSubmit"
              :disabled="submitting"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEditMode ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { useAuthStore } from '../../auth/store/authStore'
import violationService from '../services/violationService'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const schoolId = computed(() => authStore.user?.school_id)

// State
const loading = ref(false)
const submitting = ref(false)
const violationLevels = ref([])
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false
})

const form = ref({
  school_id: schoolId.value,
  name: '',
  min_point: 0,
  max_point: 0,
  description: ''
})

const isEditMode = ref(false)
const editingId = ref(null)
const formModal = ref(null)
let modalInstance = null

// Computed
const visiblePages = computed(() => {
  const pages = []
  const total = pagination.value.totalPages
  const current = pagination.value.page
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// Methods
const getLevelCardClass = (levelName) => {
  if (!levelName) return ''
  const name = levelName.toLowerCase()
  if (name.includes('ringan')) return 'border-success'
  if (name.includes('sedang')) return 'border-warning'
  if (name.includes('berat')) return 'border-danger'
  return ''
}

const loadViolationLevels = async () => {
  loading.value = true
  try {
    const params = {
      school_id: schoolId.value,
      page: pagination.value.page,
      limit: pagination.value.limit
    }
    
    const response = await violationService.getAllLevels(params)
    violationLevels.value = response.data || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    console.error('Error loading violation levels:', error)
    alert('Gagal memuat data tingkat pelanggaran')
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return
  pagination.value.page = page
  loadViolationLevels()
}

const showCreateModal = () => {
  isEditMode.value = false
  editingId.value = null
  form.value = {
    school_id: schoolId.value,
    name: '',
    min_point: 0,
    max_point: 0,
    description: ''
  }
  modalInstance.show()
}

const showEditModal = (level) => {
  isEditMode.value = true
  editingId.value = level.id
  form.value = {
    school_id: level.school_id,
    name: level.name,
    min_point: level.min_point,
    max_point: level.max_point,
    description: level.description || ''
  }
  modalInstance.show()
}

const handleSubmit = async () => {
  if (form.value.min_point >= form.value.max_point) {
    await Swal.fire({
      icon: 'warning',
      title: 'Validasi Gagal',
      text: 'Max poin harus lebih besar dari min poin',
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc2626'
    })
    return
  }

  submitting.value = true
  try {
    if (isEditMode.value) {
      await violationService.updateLevel(editingId.value, form.value)
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Tingkat pelanggaran berhasil diupdate',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      })
    } else {
      await violationService.createLevel(form.value)
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Tingkat pelanggaran berhasil ditambahkan',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      })
    }
    modalInstance.hide()
    loadViolationLevels()
  } catch (error) {
    console.error('Error saving violation level:', error)
    await Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: error.response?.data?.message || 'Gagal menyimpan data',
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc2626'
    })
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (level) => {
  const result = await Swal.fire({
    title: 'Konfirmasi Hapus',
    html: `Data "<strong>${level.name}</strong>" akan dihapus permanen. Lanjutkan?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6c757d'
  })

  if (result.isConfirmed) {
    try {
      await violationService.deleteLevel(level.id)
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Tingkat pelanggaran berhasil dihapus',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      })
      loadViolationLevels()
    } catch (error) {
      console.error('Error deleting violation level:', error)
      await Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal menghapus data',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626'
      })
    }
  }
}

// Lifecycle
onMounted(() => {
  modalInstance = new Modal(formModal.value)
  loadViolationLevels()
})
</script>

<style scoped>
.violation-levels-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h4 {
  font-weight: 600;
  color: #2c3e50;
}

.level-card {
  border-width: 3px;
  transition: all 0.3s ease;
}

.level-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.point-range {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
}

.point-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
}

.point-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #dc3545;
}

.description {
  min-height: 40px;
}
</style>
