<template>
  <div class="violation-actions-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h4 class="mb-1">Tindakan / Sanksi Pelanggaran</h4>
        <p class="text-muted mb-0">Kelola tindakan dan sanksi untuk setiap tingkat pelanggaran</p>
      </div>
      <button class="btn btn-danger" @click="showCreateModal">
        <i class="bi bi-plus-circle me-2"></i>Tambah Tindakan
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Tingkat Pelanggaran</label>
            <select v-model="filters.level_id" class="form-select" @change="loadViolationActions">
              <option value="">Semua Tingkat</option>
              <option v-for="level in levels" :key="level.id" :value="level.id">
                {{ level.name }} ({{ level.min_point }}-{{ level.max_point }} poin)
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Limit</label>
            <select v-model="filters.limit" class="form-select" @change="loadViolationActions">
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
                <th width="30%">Nama Tindakan / Sanksi</th>
                <th width="20%">Tingkat</th>
                <th width="35%">Keterangan</th>
                <th width="10%" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="violationActions.length === 0">
                <td colspan="5" class="text-center py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2 text-muted"></i>
                  <p class="mb-0">Belum ada data tindakan/sanksi</p>
                </td>
              </tr>
              <tr v-for="(action, index) in violationActions" :key="action.id">
                <td>{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-hammer-fill me-2 text-danger"></i>
                    <strong>{{ action.action_name }}</strong>
                  </div>
                </td>
                <td>
                  <span class="badge" :class="getLevelBadgeClass(action.level?.name)">
                    {{ action.level?.name }}
                  </span>
                </td>
                <td>
                  <small class="text-muted">{{ action.description || '-' }}</small>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary me-1" @click="showEditModal(action)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(action)">
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
            Menampilkan {{ violationActions.length }} dari {{ pagination.total }} data
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
              {{ isEditMode ? 'Edit Tindakan/Sanksi' : 'Tambah Tindakan/Sanksi' }}
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
                <label class="form-label">Nama Tindakan / Sanksi <span class="text-danger">*</span></label>
                <input 
                  v-model="form.action_name" 
                  type="text" 
                  class="form-control" 
                  placeholder="Misal: Peringatan Lisan, Skorsing, dll"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Keterangan</label>
                <textarea 
                  v-model="form.description" 
                  class="form-control" 
                  rows="3"
                  placeholder="Deskripsi detail tindakan/sanksi yang diberikan"
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
const violationActions = ref([])
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
  action_name: '',
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

const loadViolationActions = async () => {
  loading.value = true
  try {
    const params = {
      school_id: schoolId.value,
      level_id: filters.value.level_id || undefined,
      page: filters.value.page,
      limit: filters.value.limit
    }
    
    const response = await violationService.getAllActions(params)
    violationActions.value = response.data || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    console.error('Error loading violation actions:', error)
    alert('Gagal memuat data tindakan/sanksi')
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return
  filters.value.page = page
  loadViolationActions()
}

const showCreateModal = () => {
  isEditMode.value = false
  editingId.value = null
  form.value = {
    school_id: schoolId.value,
    level_id: '',
    action_name: '',
    description: ''
  }
  modalInstance.show()
}

const showEditModal = (action) => {
  isEditMode.value = true
  editingId.value = action.id
  form.value = {
    school_id: action.school_id,
    level_id: action.level_id,
    action_name: action.action_name,
    description: action.description || ''
  }
  modalInstance.show()
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEditMode.value) {
      await violationService.updateAction(editingId.value, form.value)
      alert('Tindakan/sanksi berhasil diupdate')
    } else {
      await violationService.createAction(form.value)
      alert('Tindakan/sanksi berhasil ditambahkan')
    }
    modalInstance.hide()
    loadViolationActions()
  } catch (error) {
    console.error('Error saving violation action:', error)
    alert(error.response?.data?.message || 'Gagal menyimpan data')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (action) => {
  if (confirm(`Data "${action.action_name}" akan dihapus permanen. Lanjutkan?`)) {
    try {
      await violationService.deleteAction(action.id)
      alert('Tindakan/sanksi berhasil dihapus')
      loadViolationActions()
    } catch (error) {
      console.error('Error deleting violation action:', error)
      alert('Gagal menghapus data')
    }
  }
}

// Lifecycle
onMounted(() => {
  modalInstance = new Modal(formModal.value)
  loadLevels()
  loadViolationActions()
})
</script>

<style scoped>
.violation-actions-page {
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
