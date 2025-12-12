<template>
  <div class="violations-data-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h4 class="mb-1">Data Pelanggaran Siswa</h4>
        <p class="text-muted mb-0">Kelola data pelanggaran dan monitoring siswa</p>
      </div>
      <button class="btn btn-danger" @click="showCreateModal">
        <i class="bi bi-plus-circle me-2"></i>Tambah Pelanggaran
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Status</label>
            <select v-model="filters.status" class="form-select" @change="loadViolations">
              <option value="">Semua Status</option>
              <option value="NEW">Baru</option>
              <option value="APPROVED">Disetujui</option>
              <option value="REJECTED">Ditolak</option>
              <option value="ACTIONED">Ditindak</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Limit</label>
            <select v-model="filters.limit" class="form-select" @change="loadViolations">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status"></div>
    </div>

    <!-- Data Table -->
    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Siswa</th>
                <th>Jenis Pelanggaran</th>
                <th>Tanggal</th>
                <th>Poin</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="violations.length === 0">
                <td colspan="7" class="text-center py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2 text-muted"></i>
                  <p class="mb-0">Belum ada data pelanggaran</p>
                </td>
              </tr>
              <tr v-for="(violation, index) in violations" :key="violation.id">
                <td>{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
                <td>
                  <strong>{{ violation.student?.name }}</strong><br>
                  <small class="text-muted">{{ violation.student?.class?.name }}</small>
                </td>
                <td>{{ violation.type?.name }}</td>
                <td>{{ formatDate(violation.date) }}</td>
                <td><span class="badge bg-warning text-dark">{{ violation.type?.point }} Poin</span></td>
                <td><span class="badge" :class="getStatusBadgeClass(violation.status)">{{ violation.status }}</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" @click="showDetailModal(violation)">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button v-if="violation.status === 'NEW'" class="btn btn-sm btn-outline-success me-1" @click="showApproveModal(violation)">
                    <i class="bi bi-check"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(violation)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
          <div class="text-muted">Menampilkan {{ violations.length }} dari {{ pagination.total }} data</div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: !pagination.hasPrevPage }">
                <button class="page-link" @click="changePage(pagination.page - 1)"><i class="bi bi-chevron-left"></i></button>
              </li>
              <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === pagination.page }">
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: !pagination.hasNextPage }">
                <button class="page-link" @click="changePage(pagination.page + 1)"><i class="bi bi-chevron-right"></i></button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div class="modal fade" ref="formModal" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah Pelanggaran Siswa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <!-- Siswa Selection with Search -->
                <div class="col-12 mb-3">
                  <label class="form-label">Siswa <span class="text-danger">*</span></label>
                  <div class="position-relative">
                    <input 
                      v-model="studentSearch" 
                      @input="searchStudents"
                      @focus="handleStudentFocus"
                      type="text" 
                      class="form-control" 
                      placeholder="Cari siswa (nama/NIS)..." 
                      autocomplete="off"
                    />
                    <div v-if="showStudentDropdown" class="search-dropdown">
                      <div v-if="filteredStudents.length === 0" class="search-dropdown-item text-muted">
                        <small>{{ allStudents.length === 0 ? 'Memuat data siswa...' : 'Tidak ada siswa ditemukan' }}</small>
                      </div>
                      <div 
                        v-for="student in filteredStudents" 
                        :key="student.id"
                        class="search-dropdown-item"
                        @click="addStudent(student)"
                      >
                        <div class="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{{ student.name }}</strong>
                            <small class="text-muted d-block">{{ student.nis }} - {{ student.class?.name || 'Belum ada kelas' }}</small>
                          </div>
                          <span class="badge bg-primary">Pilih</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Selected Students -->
                <div v-if="selectedStudents.length > 0" class="col-12 mb-3">
                  <label class="form-label">Siswa Terpilih ({{ selectedStudents.length }})</label>
                  <div class="selected-students-list">
                    <div 
                      v-for="student in selectedStudents" 
                      :key="student.id"
                      class="selected-student-item"
                    >
                      <div>
                        <strong>{{ student.name }}</strong>
                        <small class="text-muted d-block">{{ student.nis }} - {{ student.class?.name }}</small>
                      </div>
                      <button type="button" class="btn btn-sm btn-outline-danger" @click="removeStudent(student.id)">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Jenis Pelanggaran with Search -->
                <div class="col-12 mb-3">
                  <label class="form-label">Jenis Pelanggaran <span class="text-danger">*</span></label>
                  <div class="position-relative">
                    <input 
                      v-model="typeSearch" 
                      @input="searchTypes"
                      @focus="showTypeDropdown = true"
                      type="text" 
                      class="form-control" 
                      placeholder="Cari jenis pelanggaran..." 
                      autocomplete="off"
                      :readonly="form.type_id !== ''"
                    />
                    <div v-if="showTypeDropdown && filteredTypes.length > 0" class="search-dropdown">
                      <div 
                        v-for="type in filteredTypes" 
                        :key="type.id"
                        class="search-dropdown-item"
                        @click="selectType(type)"
                      >
                        <div class="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{{ type.name }}</strong>
                            <small class="text-muted d-block">Level: {{ type.level?.name }}</small>
                          </div>
                          <span class="badge bg-warning text-dark">{{ type.point }} Poin</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      v-if="form.type_id" 
                      type="button" 
                      class="btn btn-sm btn-outline-secondary clear-type-btn"
                      @click="clearType"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>

                <!-- Selected Violation Type -->
                <div v-if="form.type_id" class="col-12 mb-3">
                  <div class="alert alert-warning d-flex justify-content-between align-items-center mb-0">
                    <div>
                      <strong>{{ selectedType?.name }}</strong>
                      <small class="d-block">Level: {{ selectedType?.level?.name }} | Poin: {{ selectedType?.point }}</small>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Tanggal <span class="text-danger">*</span></label>
                  <input v-model="form.date" type="date" class="form-control" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Lokasi</label>
                  <input v-model="form.location" type="text" class="form-control" placeholder="Lokasi kejadian" />
                </div>
                <div class="col-12 mb-3">
                  <label class="form-label">Keterangan</label>
                  <textarea v-model="form.description" class="form-control" rows="3" placeholder="Deskripsi detail pelanggaran..."></textarea>
                </div>
                <div class="col-12 mb-3">
                  <label class="form-label">Bukti/Evidence (opsional)</label>
                  <input type="file" class="form-control" @change="handleFileChange" accept="image/*,.pdf" />
                  <small class="text-muted">Format: JPG, PNG, PDF (Max 5MB)</small>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-danger" @click="handleSubmit" :disabled="submitting || selectedStudents.length === 0 || !form.type_id">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              Simpan {{ selectedStudents.length > 0 ? `(${selectedStudents.length} siswa)` : '' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div class="modal fade" ref="detailModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detail Pelanggaran</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedViolation">
            <div class="row">
              <div class="col-md-6 mb-3">
                <strong>Nama Siswa:</strong><br>{{ selectedViolation.student?.name }}
              </div>
              <div class="col-md-6 mb-3">
                <strong>Kelas:</strong><br>{{ selectedViolation.student?.class?.name }}
              </div>
              <div class="col-md-6 mb-3">
                <strong>Jenis Pelanggaran:</strong><br>{{ selectedViolation.type?.name }}
              </div>
              <div class="col-md-6 mb-3">
                <strong>Poin:</strong><br><span class="badge bg-warning text-dark">{{ selectedViolation.type?.point }} Poin</span>
              </div>
              <div class="col-md-6 mb-3">
                <strong>Tanggal:</strong><br>{{ formatDate(selectedViolation.date) }}
              </div>
              <div class="col-md-6 mb-3">
                <strong>Lokasi:</strong><br>{{ selectedViolation.location || '-' }}
              </div>
              <div class="col-md-6 mb-3">
                <strong>Status:</strong><br><span class="badge" :class="getStatusBadgeClass(selectedViolation.status)">{{ selectedViolation.status }}</span>
              </div>
              <div class="col-md-6 mb-3">
                <strong>Dibuat Oleh:</strong><br>{{ selectedViolation.creator?.name }}
              </div>
              <div class="col-12 mb-3">
                <strong>Keterangan:</strong><br>{{ selectedViolation.description || '-' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    <div class="modal fade" ref="approveModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Approval Pelanggaran</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Status <span class="text-danger">*</span></label>
              <select v-model="approvalForm.status" class="form-select" required>
                <option value="">Pilih Status</option>
                <option value="APPROVED">Setujui</option>
                <option value="REJECTED">Tolak</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Tindakan/Sanksi</label>
              <select v-model="approvalForm.action_id" class="form-select">
                <option value="">Pilih Tindakan</option>
                <option v-for="action in violationActions" :key="action.id" :value="action.id">
                  {{ action.action_name }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-success" @click="handleApprove" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>Proses
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Modal } from 'bootstrap'
import { useAuthStore } from '../../auth/store/authStore'
import violationService from '../services/violationService'
import studentService from '../services/studentService'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const schoolId = computed(() => authStore.user?.school_id)

const loading = ref(false)
const submitting = ref(false)
const violations = ref([])
const violationTypes = ref([])
const violationActions = ref([])
const allStudents = ref([])
const selectedViolation = ref(null)
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false })
const filters = ref({ status: '', limit: 10, page: 1 })
const form = ref({ type_id: '', date: '', location: '', description: '', evidence_file: null })
const approvalForm = ref({ status: '', action_id: '' })
const approvingId = ref(null)

// Search and select states
const studentSearch = ref('')
const typeSearch = ref('')
const showStudentDropdown = ref(false)
const showTypeDropdown = ref(false)
const selectedStudents = ref([])
const filteredStudents = ref([])
const filteredTypes = ref([])
const selectedType = ref(null)

const formModal = ref(null)
const detailModal = ref(null)
const approveModal = ref(null)
let formModalInstance = null
let detailModalInstance = null
let approveModalInstance = null

const visiblePages = computed(() => {
  const pages = []
  const total = pagination.value.totalPages
  const current = pagination.value.page
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
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

const getStatusBadgeClass = (status) => {
  const classes = { NEW: 'bg-secondary', APPROVED: 'bg-success', REJECTED: 'bg-danger', ACTIONED: 'bg-primary' }
  return classes[status] || 'bg-secondary'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
}

const loadStudents = async () => {
  try {
    const response = await studentService.getAll({ 
      school_id: schoolId.value, 
      limit: 1000 
    })
    console.log('Students response:', response)
    
    // studentService returns response.data which is already unwrapped
    // Filter only students from current school
    const students = response.data || []
    allStudents.value = students.filter(s => s.school_id === schoolId.value)
    filteredStudents.value = allStudents.value.slice(0, 10)
    console.log('Loaded students from school:', allStudents.value.length)
  } catch (error) {
    console.error('Error loading students:', error)
    allStudents.value = []
    filteredStudents.value = []
  }
}

const loadViolationTypes = async () => {
  try {
    const response = await violationService.getAllTypes({ school_id: schoolId.value, limit: 100 })
    violationTypes.value = response.data || []
    filteredTypes.value = violationTypes.value.slice(0, 10)
  } catch (error) {
    console.error('Error loading types:', error)
  }
}

const loadViolationActions = async () => {
  try {
    const response = await violationService.getAllActions({ school_id: schoolId.value, limit: 100 })
    violationActions.value = response.data || []
  } catch (error) {
    console.error('Error loading actions:', error)
  }
}

const handleStudentFocus = () => {
  showStudentDropdown.value = true
  if (filteredStudents.value.length === 0 && allStudents.value.length > 0) {
    filteredStudents.value = allStudents.value.slice(0, 10)
  }
}

const searchStudents = () => {
  const search = studentSearch.value.toLowerCase().trim()
  console.log('Searching students:', search, 'Total:', allStudents.value.length)
  
  if (!search) {
    filteredStudents.value = allStudents.value.slice(0, 10)
  } else {
    filteredStudents.value = allStudents.value
      .filter(s => 
        s.name?.toLowerCase().includes(search) || 
        s.nis?.toLowerCase().includes(search)
      )
      .slice(0, 10)
  }
  console.log('Filtered students:', filteredStudents.value.length)
  showStudentDropdown.value = true
}

const searchTypes = () => {
  const search = typeSearch.value.toLowerCase()
  if (!search) {
    filteredTypes.value = violationTypes.value.slice(0, 10)
  } else {
    filteredTypes.value = violationTypes.value
      .filter(t => t.name.toLowerCase().includes(search))
      .slice(0, 10)
  }
  showTypeDropdown.value = true
}

const addStudent = (student) => {
  if (!selectedStudents.value.find(s => s.id === student.id)) {
    selectedStudents.value.push(student)
  }
  studentSearch.value = ''
  showStudentDropdown.value = false
}

const removeStudent = (studentId) => {
  selectedStudents.value = selectedStudents.value.filter(s => s.id !== studentId)
}

const selectType = (type) => {
  form.value.type_id = type.id
  selectedType.value = type
  typeSearch.value = type.name
  showTypeDropdown.value = false
}

const clearType = () => {
  form.value.type_id = ''
  selectedType.value = null
  typeSearch.value = ''
  showTypeDropdown.value = false
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB')
      event.target.value = ''
      return
    }
    form.value.evidence_file = file
  }
}

const loadViolations = async () => {
  loading.value = true
  try {
    const params = { status: filters.value.status || undefined, page: filters.value.page, limit: filters.value.limit }
    const response = await violationService.getAllViolations(params)
    violations.value = response.data || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    console.error('Error loading violations:', error)
    alert('Gagal memuat data pelanggaran')
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return
  filters.value.page = page
  loadViolations()
}

const showCreateModal = async () => {
  form.value = { type_id: '', date: new Date().toISOString().split('T')[0], location: '', description: '', evidence_file: null }
  selectedStudents.value = []
  selectedType.value = null
  studentSearch.value = ''
  typeSearch.value = ''
  showStudentDropdown.value = false
  showTypeDropdown.value = false
  
  // Ensure students are loaded
  if (allStudents.value.length === 0) {
    await loadStudents()
  }
  if (violationTypes.value.length === 0) {
    await loadViolationTypes()
  }
  
  formModalInstance.show()
}

const showDetailModal = (violation) => {
  selectedViolation.value = violation
  detailModalInstance.show()
}

const showApproveModal = (violation) => {
  approvingId.value = violation.id
  approvalForm.value = { status: '', action_id: '' }
  approveModalInstance.show()
}

const handleSubmit = async () => {
  if (selectedStudents.value.length === 0) {
    await Swal.fire({
      icon: 'warning',
      title: 'Validasi Gagal',
      text: 'Pilih minimal 1 siswa',
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc2626'
    })
    return
  }
  if (!form.value.type_id) {
    await Swal.fire({
      icon: 'warning',
      title: 'Validasi Gagal',
      text: 'Pilih jenis pelanggaran',
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc2626'
    })
    return
  }

  submitting.value = true
  try {
    let successCount = 0
    let errorCount = 0
    let errorMessages = []

    console.log('Starting bulk violation submission for', selectedStudents.value.length, 'students')
    console.log('Auth user:', authStore.user)
    console.log('Token exists:', !!authStore.token)
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)

    // Create violation for each selected student
    for (const student of selectedStudents.value) {
      try {
        const violationData = {
          student_id: student.id,
          type_id: form.value.type_id,
          date: form.value.date,
          location: form.value.location || null,
          description: form.value.description || null
        }

        console.log('Creating violation for student:', student.name, violationData)
        console.log('Access token:', localStorage.getItem('access_token'))
        console.log('User data:', authStore.user)

        const result = await violationService.createViolation(violationData)
        console.log('Violation created:', result)

        // Upload evidence if exists
        if (form.value.evidence_file && result.id) {
          const formData = new FormData()
          formData.append('evidence', form.value.evidence_file)
          try {
            await violationService.uploadEvidence(result.id, formData)
          } catch (uploadError) {
            console.error('Error uploading evidence:', uploadError)
          }
        }

        successCount++
      } catch (error) {
        console.error(`Error saving violation for student ${student.name}:`, error)
        console.error('Error response:', error.response?.data)
        errorCount++
        const errorMsg = error.response?.data?.message || error.message
        errorMessages.push(`${student.name}: ${errorMsg}`)
      }
    }

    if (successCount > 0) {
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        html: `Berhasil menyimpan <strong>${successCount}</strong> pelanggaran${errorCount > 0 ? `, ${errorCount} gagal` : ''}`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#16a34a'
      })
      formModalInstance.hide()
      loadViolations()
    } else {
      const detailMsg = errorMessages.length > 0 ? '<br><br>Detail:<br>' + errorMessages.join('<br>') : ''
      await Swal.fire({
        icon: 'error',
        title: 'Gagal',
        html: 'Semua proses penyimpanan gagal!' + detailMsg,
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626'
      })
    }
  } catch (error) {
    console.error('Error in bulk submit:', error)
    console.error('Error response:', error.response?.data)
    await Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: error.response?.data?.message || error.message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc2626'
    })
  } finally {
    submitting.value = false
  }
}

const handleApprove = async () => {
  if (!approvalForm.value.status) {
    await Swal.fire({
      icon: 'warning',
      title: 'Validasi Gagal',
      text: 'Pilih status terlebih dahulu',
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc2626'
    })
    return
  }
  submitting.value = true
  try {
    await violationService.approveViolation(approvingId.value, approvalForm.value)
    await Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Pelanggaran berhasil diproses',
      timer: 2000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    })
    approveModalInstance.hide()
    loadViolations()
  } catch (error) {
    console.error('Error approving violation:', error)
    await Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Gagal memproses data',
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc2626'
    })
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (violation) => {
  const result = await Swal.fire({
    title: 'Konfirmasi Hapus',
    text: 'Data pelanggaran akan dihapus permanen. Lanjutkan?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6c757d'
  })

  if (result.isConfirmed) {
    try {
      await violationService.deleteViolation(violation.id)
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Pelanggaran berhasil dihapus',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      })
      loadViolations()
    } catch (error) {
      console.error('Error deleting violation:', error)
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

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.position-relative')) {
    showStudentDropdown.value = false
    showTypeDropdown.value = false
  }
}

onMounted(() => {
  formModalInstance = new Modal(formModal.value)
  detailModalInstance = new Modal(detailModal.value)
  approveModalInstance = new Modal(approveModal.value)
  loadStudents()
  loadViolationTypes()
  loadViolationActions()
  loadViolations()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.violations-data-page { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h4 { font-weight: 600; color: #2c3e50; }
.table th { background-color: #f8f9fa; font-weight: 600; color: #495057; border-bottom: 2px solid #dee2e6; }
.badge { font-size: 0.85rem; padding: 0.4em 0.8em; }

/* Search Dropdown */
.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1050;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  margin-top: 4px;
}

.search-dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f1f3f5;
  transition: background-color 0.2s;
}

.search-dropdown-item:hover {
  background-color: #f8f9fa;
}

.search-dropdown-item:last-child {
  border-bottom: none;
}

/* Selected Students List */
.selected-students-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background: #f8f9fa;
}

.selected-student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  background: white;
  margin: 4px;
  border-radius: 0.25rem;
}

.selected-student-item:last-child {
  border-bottom: none;
}

/* Clear Type Button */
.clear-type-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem 0.5rem;
  line-height: 1;
}

/* Position Relative Container */
.position-relative {
  position: relative;
}
</style>
