<template>
  <div class="violation-types-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h4 class="mb-1">Jenis Pelanggaran</h4>
        <p class="text-muted mb-0">Kelola jenis pelanggaran siswa</p>
      </div>
      <button class="btn btn-danger" @click="showCreateModal">
        <i class="bi bi-plus-circle me-2"></i>Tambah Jenis Pelanggaran
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Tingkat Pelanggaran</label>
            <select v-model="filters.level_id" class="form-select" @change="loadViolationTypes">
              <option value="">Semua Tingkat</option>
              <option v-for="level in levels" :key="level.id" :value="level.id">
                {{ level.name }} ({{ level.min_point }}-{{ level.max_point }} poin)
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Limit</label>
            <select v-model="filters.limit" class="form-select" @change="loadViolationTypes">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
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
                <th width="5%">#</th>
                <th width="30%">Nama Jenis Pelanggaran</th>
                <th width="20%">Tingkat</th>
                <th width="10%">Poin</th>
                <th width="25%">Keterangan</th>
                <th width="10%" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="violationTypes.length === 0">
                <td colspan="6" class="text-center py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2 text-muted"></i>
                  <p class="mb-0">Belum ada data jenis pelanggaran</p>
                </td>
              </tr>
              <tr v-for="(type, index) in violationTypes" :key="type.id">
                <td>{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
                <td>
                  <strong>{{ type.name }}</strong>
                </td>
                <td>
                  <span class="badge" :class="getLevelBadgeClass(type.level?.name)">
                    {{ type.level?.name }}
                  </span>
                </td>
                <td>
                  <span class="badge bg-warning text-dark">{{ type.point }} Poin</span>
                </td>
                <td>
                  <small class="text-muted">{{ type.description || '-' }}</small>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary me-1" @click="showEditModal(type)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(type)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
          <div class="text-muted">
            Menampilkan {{ violationTypes.length }} dari {{ pagination.total }} data
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
              {{ isEditMode ? 'Edit Jenis Pelanggaran' : 'Tambah Jenis Pelanggaran' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Tingkat Pelanggaran <span class="text-danger">*</span></label>
                <select v-model="form.level_id" class="form-select" required>
                  <option value="">Pilih Tingkat</option>
                  <option v-for="level in levels" :key="level.id" :value="level.id">
                    {{ level.name }} ({{ level.min_point }}-{{ level.max_point }} poin)
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Nama Jenis Pelanggaran <span class="text-danger">*</span></label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  class="form-control" 
                  placeholder="Misal: Terlambat Masuk Kelas"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Poin <span class="text-danger">*</span></label>
                <input 
                  v-model.number="form.point" 
                  type="number" 
                  class="form-control" 
                  placeholder="Jumlah poin pelanggaran"
                  required
                  min="1"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Keterangan</label>
                <textarea 
                  v-model="form.description" 
                  class="form-control" 
                  rows="3"
                  placeholder="Deskripsi jenis pelanggaran"
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

const authStore = useAuthStore()
const schoolId = computed(() => authStore.user?.school_id)

// State
const loading = ref(false)
const submitting = ref(false)
const violationTypes = ref([])
const levels = ref([])
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false
})

const filters = ref({
  school_id: schoolId.value,
  level_id: '',
  limit: 10,
  page: 1
})

const form = ref({
  school_id: schoolId.value,
  level_id: '',
  name: '',
  point: null,
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
const getLevelBadgeClass = (levelName) => {
  if (!levelName) return 'bg-secondary'
  const name = levelName.toLowerCase()
  if (name.includes('ringan')) return 'bg-success'
  if (name.includes('sedang')) return 'bg-warning'
  if (name.includes('berat')) return 'bg-danger'
  return 'bg-secondary'
}

const loadLevels = async () => {
  try {
    const response = await violationService.getAllLevels({ 
      school_id: schoolId.value,
      limit: 100 
    })
    levels.value = response.data || []
  } catch (error) {
    console.error('Error loading levels:', error)
  }
}

const loadViolationTypes = async () => {
  loading.value = true
  try {
    const params = {
      school_id: schoolId.value,
      level_id: filters.value.level_id || undefined,
      page: filters.value.page,
      limit: filters.value.limit
    }
    
    const response = await violationService.getAllTypes(params)
    violationTypes.value = response.data || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    console.error('Error loading violation types:', error)
    alert('Gagal memuat data jenis pelanggaran')
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return
  filters.value.page = page
  loadViolationTypes()
}

const showCreateModal = () => {
  isEditMode.value = false
  editingId.value = null
  form.value = {
    school_id: schoolId.value,
    level_id: '',
    name: '',
    point: null,
    description: ''
  }
  modalInstance.show()
}

const showEditModal = (type) => {
  isEditMode.value = true
  editingId.value = type.id
  form.value = {
    school_id: type.school_id,
    level_id: type.level_id,
    name: type.name,
    point: type.point,
    description: type.description || ''
  }
  modalInstance.show()
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEditMode.value) {
      await violationService.updateType(editingId.value, form.value)
      alert('Jenis pelanggaran berhasil diupdate')
    } else {
      await violationService.createType(form.value)
      alert('Jenis pelanggaran berhasil ditambahkan')
    }
    modalInstance.hide()
    loadViolationTypes()
  } catch (error) {
    console.error('Error saving violation type:', error)
    alert(error.response?.data?.message || 'Gagal menyimpan data')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (type) => {
  if (confirm(`Data "${type.name}" akan dihapus permanen. Lanjutkan?`)) {
    try {
      await violationService.deleteType(type.id)
      alert('Jenis pelanggaran berhasil dihapus')
      loadViolationTypes()
    } catch (error) {
      console.error('Error deleting violation type:', error)
      alert('Gagal menghapus data')
    }
  }
}

// Lifecycle
onMounted(() => {
  modalInstance = new Modal(formModal.value)
  loadLevels()
  loadViolationTypes()
})
</script>

<style scoped>
.violation-types-page {
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

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.badge {
  font-size: 0.85rem;
  padding: 0.4em 0.8em;
}
</style>
