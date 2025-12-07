<template>
  <div class="achievements-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Data Lomba & Prestasi</h2>
      <button class="btn btn-danger" @click="openModal()">
        <i class="bi bi-plus-circle me-2"></i>Tambah Prestasi
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control" 
              placeholder="Cari judul, penyelenggara..."
              @input="handleSearch"
            >
          </div>
          <div class="col-md-2">
            <select v-model="filterEventType" class="form-select" @change="handleSearch">
              <option value="">Semua Jenis Kegiatan</option>
              <option value="Olimpiade">Olimpiade</option>
              <option value="Lomba">Lomba</option>
              <option value="Kompetisi">Kompetisi</option>
              <option value="Festival">Festival</option>
              <option value="Kejuaraan">Kejuaraan</option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filterLevel" class="form-select" @change="handleSearch">
              <option value="">Semua Tingkat</option>
              <option value="Sekolah">Sekolah</option>
              <option value="Kecamatan">Kecamatan</option>
              <option value="Kabupaten">Kabupaten</option>
              <option value="Provinsi">Provinsi</option>
              <option value="Nasional">Nasional</option>
              <option value="Internasional">Internasional</option>
            </select>
          </div>
          <div class="col-md-2">
            <input 
              v-model="filterYear" 
              type="number" 
              class="form-control" 
              placeholder="Tahun"
              @input="handleSearch"
            >
          </div>
          <div class="col-md-3">
            <div class="d-flex gap-2">
              <button class="btn btn-secondary" @click="resetFilters">
                <i class="bi bi-arrow-clockwise me-1"></i>Reset
              </button>
              <button class="btn btn-success" @click="exportData">
                <i class="bi bi-file-earmark-excel me-1"></i>Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card border-primary">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-muted mb-1">Total Prestasi</h6>
                <h3 class="mb-0">{{ statistics.total }}</h3>
              </div>
              <i class="bi bi-trophy text-primary" style="font-size: 2rem;"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-success">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-muted mb-1">Tingkat Nasional</h6>
                <h3 class="mb-0">{{ statistics.national }}</h3>
              </div>
              <i class="bi bi-flag text-success" style="font-size: 2rem;"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-warning">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-muted mb-1">Tingkat Provinsi</h6>
                <h3 class="mb-0">{{ statistics.provincial }}</h3>
              </div>
              <i class="bi bi-geo-alt text-warning" style="font-size: 2rem;"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-info">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-muted mb-1">Tahun Ini</h6>
                <h3 class="mb-0">{{ statistics.thisYear }}</h3>
              </div>
              <i class="bi bi-calendar-check text-info" style="font-size: 2rem;"></i>
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

    <!-- Table -->
    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>No</th>
                <th>Judul Kegiatan</th>
                <th>Jenis</th>
                <th>Tingkat</th>
                <th>Penyelenggara</th>
                <th>Lokasi</th>
                <th>Tanggal</th>
                <th>Peserta</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedAchievements.length === 0">
                <td colspan="9" class="text-center text-muted">Tidak ada data prestasi</td>
              </tr>
              <tr v-for="(achievement, index) in paginatedAchievements" :key="achievement.id">
                <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
                <td>
                  <strong>{{ achievement.title }}</strong>
                  <div v-if="achievement.description" class="text-muted small">
                    {{ truncateText(achievement.description, 50) }}
                  </div>
                </td>
                <td>
                  <span class="badge bg-info">{{ achievement.event_type }}</span>
                </td>
                <td>
                  <span class="badge" :class="getLevelBadgeClass(achievement.level)">
                    {{ achievement.level }}
                  </span>
                </td>
                <td>{{ achievement.organizer || '-' }}</td>
                <td>{{ achievement.location || '-' }}</td>
                <td>{{ formatDate(achievement.event_date) }}</td>
                <td>
                  <span class="badge bg-secondary">
                    {{ getParticipantCount(achievement) }} peserta
                  </span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button 
                      class="btn btn-outline-info" 
                      @click="viewDetail(achievement)"
                      title="Detail"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button 
                      class="btn btn-outline-primary" 
                      @click="openModal(achievement)"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger" 
                      @click="handleDelete(achievement)"
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
            {{ Math.min(currentPage * perPage, filteredAchievements.length) }} 
            dari {{ filteredAchievements.length }} data
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage > 1 && currentPage--">Previous</a>
              </li>
              <li 
                v-for="page in displayedPages" 
                :key="page" 
                class="page-item" 
                :class="{ active: currentPage === page }"
              >
                <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="currentPage < totalPages && currentPage++">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div 
      class="modal fade" 
      id="achievementModal" 
      tabindex="-1" 
      ref="modalElement"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Edit Prestasi' : 'Tambah Prestasi' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row g-3">
                <!-- Title -->
                <div class="col-md-12">
                  <label class="form-label">Judul Kegiatan <span class="text-danger">*</span></label>
                  <input 
                    v-model="formData.title" 
                    type="text" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.title }"
                    maxlength="150"
                    placeholder="Contoh: Olimpiade Matematika Nasional 2025"
                  >
                  <div v-if="errors.title" class="invalid-feedback">{{ errors.title }}</div>
                </div>

                <!-- Event Type & Level -->
                <div class="col-md-6">
                  <label class="form-label">Jenis Kegiatan <span class="text-danger">*</span></label>
                  <select 
                    v-model="formData.event_type" 
                    class="form-select"
                    :class="{ 'is-invalid': errors.event_type }"
                  >
                    <option value="">Pilih Jenis</option>
                    <option value="Olimpiade">Olimpiade</option>
                    <option value="Lomba">Lomba</option>
                    <option value="Kompetisi">Kompetisi</option>
                    <option value="Festival">Festival</option>
                    <option value="Kejuaraan">Kejuaraan</option>
                    <option value="Perlombaan">Perlombaan</option>
                  </select>
                  <div v-if="errors.event_type" class="invalid-feedback">{{ errors.event_type }}</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Tingkat <span class="text-danger">*</span></label>
                  <select 
                    v-model="formData.level" 
                    class="form-select"
                    :class="{ 'is-invalid': errors.level }"
                  >
                    <option value="">Pilih Tingkat</option>
                    <option value="Sekolah">Sekolah</option>
                    <option value="Kecamatan">Kecamatan</option>
                    <option value="Kabupaten">Kabupaten</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                  <div v-if="errors.level" class="invalid-feedback">{{ errors.level }}</div>
                </div>

                <!-- Organizer & Location -->
                <div class="col-md-6">
                  <label class="form-label">Penyelenggara</label>
                  <input 
                    v-model="formData.organizer" 
                    type="text" 
                    class="form-control" 
                    maxlength="150"
                    placeholder="Contoh: Dinas Pendidikan"
                  >
                </div>

                <div class="col-md-6">
                  <label class="form-label">Lokasi</label>
                  <input 
                    v-model="formData.location" 
                    type="text" 
                    class="form-control" 
                    maxlength="150"
                    placeholder="Contoh: Jakarta"
                  >
                </div>

                <!-- Event Date -->
                <div class="col-md-6">
                  <label class="form-label">Tanggal Kegiatan <span class="text-danger">*</span></label>
                  <input 
                    v-model="formData.event_date" 
                    type="date" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.event_date }"
                  >
                  <div v-if="errors.event_date" class="invalid-feedback">{{ errors.event_date }}</div>
                </div>

                <!-- Description -->
                <div class="col-md-12">
                  <label class="form-label">Deskripsi</label>
                  <textarea 
                    v-model="formData.description" 
                    class="form-control" 
                    rows="3"
                    placeholder="Deskripsi singkat tentang kegiatan..."
                  ></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="handleSubmit"
              :disabled="saving"
            >
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import achievementsService from '../services/achievementsService'
import { useAuthStore } from '../../auth/store/authStore'

const router = useRouter()
const authStore = useAuthStore()

// State
const achievements = ref([])
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const filterEventType = ref('')
const filterLevel = ref('')
const filterYear = ref('')
const currentPage = ref(1)
const perPage = ref(10)

// Modal
const modalElement = ref(null)
let modalInstance = null
const isEdit = ref(false)
const formData = ref({
  title: '',
  event_type: '',
  level: '',
  organizer: '',
  location: '',
  event_date: '',
  description: ''
})
const errors = ref({})

// Computed
const filteredAchievements = computed(() => {
  let result = achievements.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(achievement => 
      achievement.title?.toLowerCase().includes(query) ||
      achievement.organizer?.toLowerCase().includes(query) ||
      achievement.description?.toLowerCase().includes(query)
    )
  }

  // Event type filter
  if (filterEventType.value) {
    result = result.filter(a => a.event_type === filterEventType.value)
  }

  // Level filter
  if (filterLevel.value) {
    result = result.filter(a => a.level === filterLevel.value)
  }

  // Year filter
  if (filterYear.value) {
    result = result.filter(a => {
      const year = new Date(a.event_date).getFullYear()
      return year === parseInt(filterYear.value)
    })
  }

  return result
})

const paginatedAchievements = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredAchievements.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredAchievements.value.length / perPage.value)
})

const displayedPages = computed(() => {
  const pages = []
  const maxVisible = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let endPage = Math.min(totalPages.value, startPage + maxVisible - 1)

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }
  return pages
})

const statistics = computed(() => {
  const currentYear = new Date().getFullYear()
  return {
    total: achievements.value.length,
    national: achievements.value.filter(a => a.level === 'Nasional').length,
    provincial: achievements.value.filter(a => a.level === 'Provinsi').length,
    thisYear: achievements.value.filter(a => {
      const year = new Date(a.event_date).getFullYear()
      return year === currentYear
    }).length
  }
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    const schoolId = authStore.user?.school_id || null
    const response = await achievementsService.getAll(schoolId)
    achievements.value = Array.isArray(response) ? response : (response.data || [])
  } catch (error) {
    console.error('Failed to load achievements:', error)
    alert('Gagal memuat data: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  filterEventType.value = ''
  filterLevel.value = ''
  filterYear.value = ''
  currentPage.value = 1
}

const openModal = (achievement = null) => {
  isEdit.value = !!achievement
  errors.value = {}
  
  if (achievement) {
    formData.value = {
      id: achievement.id,
      title: achievement.title,
      event_type: achievement.event_type,
      level: achievement.level,
      organizer: achievement.organizer || '',
      location: achievement.location || '',
      event_date: achievement.event_date,
      description: achievement.description || ''
    }
  } else {
    formData.value = {
      title: '',
      event_type: '',
      level: '',
      organizer: '',
      location: '',
      event_date: '',
      description: ''
    }
  }
  
  modalInstance.show()
}

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.title?.trim()) errors.value.title = 'Judul kegiatan wajib diisi'
  if (!formData.value.event_type) errors.value.event_type = 'Jenis kegiatan wajib diisi'
  if (!formData.value.level) errors.value.level = 'Tingkat wajib diisi'
  if (!formData.value.event_date) errors.value.event_date = 'Tanggal kegiatan wajib diisi'
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  saving.value = true
  try {
    const payload = {
      title: formData.value.title,
      event_type: formData.value.event_type,
      level: formData.value.level,
      organizer: formData.value.organizer,
      location: formData.value.location,
      event_date: formData.value.event_date,
      description: formData.value.description,
      school_id: authStore.user?.school_id
    }
    
    if (isEdit.value) {
      await achievementsService.update(formData.value.id, payload)
      alert('Data prestasi berhasil diperbarui')
    } else {
      await achievementsService.create(payload)
      alert('Data prestasi berhasil ditambahkan')
    }
    
    modalInstance.hide()
    loadData()
  } catch (error) {
    console.error('Failed to save achievement:', error)
    alert('Gagal menyimpan data: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

const handleDelete = async (achievement) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus prestasi "${achievement.title}"?`)) {
    return
  }
  
  try {
    await achievementsService.delete(achievement.id)
    alert('Data prestasi berhasil dihapus')
    loadData()
  } catch (error) {
    console.error('Failed to delete achievement:', error)
    alert('Gagal menghapus data: ' + (error.response?.data?.message || error.message))
  }
}

const viewDetail = (achievement) => {
  router.push(`/admin/achievements/${achievement.id}`)
}

const getParticipantCount = (achievement) => {
  if (achievement.participants && Array.isArray(achievement.participants)) {
    return achievement.participants.length
  }
  return 0
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const getLevelBadgeClass = (level) => {
  const classes = {
    'Internasional': 'bg-danger',
    'Nasional': 'bg-success',
    'Provinsi': 'bg-warning',
    'Kabupaten': 'bg-info',
    'Kecamatan': 'bg-secondary',
    'Sekolah': 'bg-primary'
  }
  return classes[level] || 'bg-secondary'
}

const exportData = () => {
  alert('Fitur export akan segera tersedia')
}

onMounted(() => {
  modalInstance = new Modal(modalElement.value)
  loadData()
})
</script>

<style scoped>
.achievements-page {
  padding: 20px;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  white-space: nowrap;
}

.pagination .page-item.active .page-link {
  background-color: #dc2626;
  border-color: #dc2626;
}

.pagination .page-link {
  color: #dc2626;
}

.pagination .page-link:hover {
  color: #b91c1c;
}

.card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
