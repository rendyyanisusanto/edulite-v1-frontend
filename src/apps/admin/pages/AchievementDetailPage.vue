<template>
  <div class="achievement-detail-page">
    <!-- Back Button & Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-outline-secondary" @click="goBack">
          <i class="bi bi-arrow-left me-2"></i>Kembali
        </button>
        <h2>Detail Prestasi</h2>
      </div>
      <div class="d-flex gap-2">
        <div class="dropdown" ref="exportDropdownRef">
          <button class="btn btn-success dropdown-toggle" type="button" @click="toggleExportDropdown">
            <i class="bi bi-download me-2"></i>Export
          </button>
          <ul class="dropdown-menu" :class="{ show: showExportDropdown }">
            <li><a class="dropdown-item" href="#" @click.prevent="exportToExcel"><i class="bi bi-file-earmark-excel me-2"></i>Export Excel</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="exportToPDF"><i class="bi bi-file-earmark-pdf me-2"></i>Export PDF</a></li>
          </ul>
        </div>
        <button class="btn btn-danger" @click="editAchievement">
          <i class="bi bi-pencil me-2"></i>Edit Prestasi
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else>
      <!-- Achievement Info Card -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-8">
              <h3>{{ achievement.title }}</h3>
              <div class="mt-3">
                <span class="badge bg-info me-2">{{ achievement.event_type }}</span>
                <span class="badge" :class="getLevelBadgeClass(achievement.level)">
                  {{ achievement.level }}
                </span>
              </div>
              <div class="mt-3">
                <p v-if="achievement.description" class="text-muted mb-2">
                  {{ achievement.description }}
                </p>
                <div class="row g-2">
                  <div class="col-md-6">
                    <small class="text-muted">Penyelenggara:</small>
                    <div>{{ achievement.organizer || '-' }}</div>
                  </div>
                  <div class="col-md-6">
                    <small class="text-muted">Lokasi:</small>
                    <div>{{ achievement.location || '-' }}</div>
                  </div>
                  <div class="col-md-6">
                    <small class="text-muted">Tanggal:</small>
                    <div>{{ formatDate(achievement.event_date) }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="statistics-cards">
                <div class="stat-card stat-card-primary">
                  <div class="stat-icon">
                    <i class="bi bi-people-fill"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-label">Total Peserta</div>
                    <div class="stat-value">{{ participants.length }}</div>
                  </div>
                </div>
                
                <div class="stat-card stat-card-success">
                  <div class="stat-icon">
                    <i class="bi bi-trophy-fill"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-label">Total Prestasi</div>
                    <div class="stat-value">{{ totalResults }}</div>
                  </div>
                </div>
                
                <div class="stat-card stat-card-info">
                  <div class="stat-icon">
                    <i class="bi bi-image-fill"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-label">Dokumentasi</div>
                    <div class="stat-value">{{ documents.length }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <a 
            class="nav-link" 
            :class="{ active: activeTab === 'participants' }"
            href="#" 
            @click.prevent="activeTab = 'participants'"
          >
            <i class="bi bi-people me-2"></i>Peserta & Hasil
          </a>
        </li>
        <li class="nav-item">
          <a 
            class="nav-link" 
            :class="{ active: activeTab === 'documents' }"
            href="#" 
            @click.prevent="activeTab = 'documents'"
          >
            <i class="bi bi-file-earmark-image me-2"></i>Dokumentasi
          </a>
        </li>
      </ul>

      <!-- Participants Tab -->
      <div v-show="activeTab === 'participants'">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Daftar Peserta & Hasil</h5>
            <button class="btn btn-sm btn-danger" @click="openParticipantModal()">
              <i class="bi bi-plus-circle me-1"></i>Tambah Peserta
            </button>
          </div>
          <div class="card-body">
            <div v-if="participants.length === 0" class="text-center text-muted py-5">
              Belum ada peserta
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Peserta</th>
                    <th>Peran</th>
                    <th>Kategori</th>
                    <th>Prestasi</th>
                    <th>Sertifikat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(participant, index) in participants" :key="participant.id">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <strong>{{ getParticipantName(participant) }}</strong>
                      <div class="small text-muted">{{ getParticipantType(participant) }}</div>
                    </td>
                    <td>
                      <span class="badge bg-primary">{{ participant.role }}</span>
                    </td>
                    <td>{{ getParticipantResult(participant)?.category || '-' }}</td>
                    <td>
                      <div v-if="getParticipantResult(participant)">
                        <span class="badge bg-warning text-dark">{{ getParticipantResult(participant).rank }}</span>
                        <div v-if="getParticipantResult(participant).score" class="small">
                          Score: {{ getParticipantResult(participant).score }}
                        </div>
                      </div>
                      <button 
                        v-else
                        class="btn btn-sm btn-outline-success"
                        @click="openResultModal(participant)"
                      >
                        <i class="bi bi-plus"></i> Tambah Hasil
                      </button>
                    </td>
                    <td>
                      <div v-if="getParticipantResult(participant)?.certificate_file">
                        <a :href="getParticipantResult(participant).certificate_file" target="_blank" class="btn btn-sm btn-outline-info">
                          <i class="bi bi-file-earmark-pdf"></i> Lihat
                        </a>
                        <button 
                          class="btn btn-sm btn-outline-danger ms-1"
                          @click="deleteCertificate(participant)"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                      <button 
                        v-else-if="getParticipantResult(participant)"
                        class="btn btn-sm btn-outline-primary"
                        @click="openCertificateUpload(participant)"
                      >
                        <i class="bi bi-upload"></i> Upload
                      </button>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button 
                          v-if="getParticipantResult(participant)"
                          class="btn btn-outline-primary" 
                          @click="openResultModal(participant)"
                          title="Edit Hasil"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button 
                          class="btn btn-outline-danger" 
                          @click="deleteParticipant(participant)"
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
          </div>
        </div>
      </div>

      <!-- Documents Tab -->
      <div v-show="activeTab === 'documents'">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Dokumentasi Kegiatan</h5>
            <button class="btn btn-sm btn-danger" @click="openDocumentUpload()">
              <i class="bi bi-upload me-1"></i>Upload Dokumentasi
            </button>
          </div>
          <div class="card-body">
            <div v-if="documents.length === 0" class="text-center text-muted py-5">
              Belum ada dokumentasi
            </div>
            <div v-else class="row g-3">
              <div v-for="doc in documents" :key="doc.id" class="col-md-3">
                <div class="card">
                  <img 
                    v-if="isImage(doc.file_path)" 
                    :src="doc.file_path" 
                    class="card-img-top doc-thumbnail"
                    :alt="doc.caption"
                    @click="viewImage(doc.file_path)"
                    style="cursor: pointer;"
                  >
                  <div v-else class="card-img-top doc-placeholder">
                    <i class="bi bi-file-earmark"></i>
                  </div>
                  <div class="card-body">
                    <p class="card-text small">{{ doc.caption || 'Tidak ada caption' }}</p>
                    <div class="d-flex gap-1">
                      <a :href="doc.file_path" target="_blank" class="btn btn-sm btn-outline-primary flex-grow-1">
                        <i class="bi bi-eye"></i>
                      </a>
                      <button 
                        class="btn btn-sm btn-outline-danger"
                        @click="deleteDocument(doc)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievement Edit Modal -->
    <div class="modal fade" id="achievementEditModal" tabindex="-1" ref="achievementModalElement">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Prestasi</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleAchievementSubmit">
              <div class="row g-3">
                <div class="col-md-12">
                  <label class="form-label">Judul Kegiatan <span class="text-danger">*</span></label>
                  <input v-model="achievementForm.title" type="text" class="form-control" :class="{ 'is-invalid': achievementErrors.title }" maxlength="150">
                  <div v-if="achievementErrors.title" class="invalid-feedback">{{ achievementErrors.title }}</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Jenis Kegiatan <span class="text-danger">*</span></label>
                  <select v-model="achievementForm.event_type" class="form-select" :class="{ 'is-invalid': achievementErrors.event_type }">
                    <option value="">Pilih Jenis</option>
                    <option value="Olimpiade">Olimpiade</option>
                    <option value="Lomba">Lomba</option>
                    <option value="Kompetisi">Kompetisi</option>
                    <option value="Festival">Festival</option>
                    <option value="Kejuaraan">Kejuaraan</option>
                    <option value="Perlombaan">Perlombaan</option>
                  </select>
                  <div v-if="achievementErrors.event_type" class="invalid-feedback">{{ achievementErrors.event_type }}</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Tingkat <span class="text-danger">*</span></label>
                  <select v-model="achievementForm.level" class="form-select" :class="{ 'is-invalid': achievementErrors.level }">
                    <option value="">Pilih Tingkat</option>
                    <option value="Sekolah">Sekolah</option>
                    <option value="Kecamatan">Kecamatan</option>
                    <option value="Kabupaten">Kabupaten</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                  <div v-if="achievementErrors.level" class="invalid-feedback">{{ achievementErrors.level }}</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Penyelenggara</label>
                  <input v-model="achievementForm.organizer" type="text" class="form-control" maxlength="150">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Lokasi</label>
                  <input v-model="achievementForm.location" type="text" class="form-control" maxlength="150">
                </div>

                <div class="col-md-6">
                  <label class="form-label">Tanggal Kegiatan <span class="text-danger">*</span></label>
                  <input v-model="achievementForm.event_date" type="date" class="form-control" :class="{ 'is-invalid': achievementErrors.event_date }">
                  <div v-if="achievementErrors.event_date" class="invalid-feedback">{{ achievementErrors.event_date }}</div>
                </div>

                <div class="col-md-12">
                  <label class="form-label">Deskripsi</label>
                  <textarea v-model="achievementForm.description" class="form-control" rows="3"></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-danger" @click="handleAchievementSubmit" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Participant Modal -->
    <div class="modal fade" id="participantModal" tabindex="-1" ref="participantModalElement">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah Peserta</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleParticipantSubmit">
              <div class="mb-3">
                <label class="form-label">Tipe Peserta <span class="text-danger">*</span></label>
                <select v-model="participantForm.type" class="form-select" @change="clearParticipantSelection">
                  <option value="">Pilih Tipe</option>
                  <option value="student">Siswa</option>
                  <option value="teacher">Guru/Pembina</option>
                </select>
              </div>

              <div v-if="participantForm.type === 'student'" class="mb-3">
                <label class="form-label">Pilih Siswa <span class="text-danger">*</span></label>
                <input 
                  v-model="studentSearchQuery" 
                  type="text" 
                  class="form-control mb-2" 
                  placeholder="Cari siswa berdasarkan nama atau NIS..."
                >
                <div class="select-list-container">
                  <div 
                    v-for="student in filteredStudents" 
                    :key="student.id" 
                    class="select-list-item"
                    :class="{ 'active': participantForm.student_id === student.id }"
                    @click="selectStudent(student.id)"
                  >
                    <div class="fw-bold">{{ student.name }}</div>
                    <small class="text-muted">NIS: {{ student.nis }}</small>
                  </div>
                  <div v-if="filteredStudents.length === 0" class="select-list-empty">
                    Tidak ada siswa ditemukan
                  </div>
                </div>
              </div>

              <div v-if="participantForm.type === 'teacher'" class="mb-3">
                <label class="form-label">Pilih Guru <span class="text-danger">*</span></label>
                <input 
                  v-model="teacherSearchQuery" 
                  type="text" 
                  class="form-control mb-2" 
                  placeholder="Cari guru berdasarkan nama atau NIP..."
                >
                <div class="select-list-container">
                  <div 
                    v-for="teacher in filteredTeachers" 
                    :key="teacher.id" 
                    class="select-list-item"
                    :class="{ 'active': participantForm.teacher_id === teacher.id }"
                    @click="selectTeacher(teacher.id)"
                  >
                    <div class="fw-bold">{{ teacher.name }}</div>
                    <small class="text-muted">NIP: {{ teacher.nip }}</small>
                  </div>
                  <div v-if="filteredTeachers.length === 0" class="select-list-empty">
                    Tidak ada guru ditemukan
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Peran <span class="text-danger">*</span></label>
                <select v-model="participantForm.role" class="form-select">
                  <option value="">Pilih Peran</option>
                  <option value="Peserta">Peserta</option>
                  <option value="Pelatih">Pelatih</option>
                  <option value="Pendamping">Pendamping</option>
                  <option value="Pembina">Pembina</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Catatan</label>
                <textarea v-model="participantForm.notes" class="form-control" rows="2"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-danger" @click="handleParticipantSubmit" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Result Modal -->
    <div class="modal fade" id="resultModal" tabindex="-1" ref="resultModalElement">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ resultForm.id ? 'Edit' : 'Tambah' }} Hasil Prestasi</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleResultSubmit">
              <div class="mb-3">
                <label class="form-label">Prestasi/Peringkat <span class="text-danger">*</span></label>
                <input 
                  v-model="resultForm.rank" 
                  type="text" 
                  class="form-control"
                  placeholder="Contoh: Juara 1, Juara 2, Finalis"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Kategori</label>
                <input 
                  v-model="resultForm.category" 
                  type="text" 
                  class="form-control"
                  placeholder="Contoh: Tunggal, Beregu, Putra"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Skor/Nilai</label>
                <input 
                  v-model="resultForm.score" 
                  type="text" 
                  class="form-control"
                  placeholder="Contoh: 95, 85.5"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Catatan</label>
                <textarea v-model="resultForm.notes" class="form-control" rows="2"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-danger" @click="handleResultSubmit" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Upload Modal -->
    <div class="modal fade" id="documentModal" tabindex="-1" ref="documentModalElement">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Upload Dokumentasi</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleDocumentUpload">
              <div class="mb-3">
                <label class="form-label">File <span class="text-danger">*</span></label>
                <input 
                  ref="documentFileInput"
                  type="file" 
                  class="form-control"
                  accept="image/*,application/pdf"
                  @change="handleDocumentFileSelect"
                >
                <small class="text-muted">Format: JPG, PNG, PDF. Maksimal 5MB.</small>
              </div>

              <div class="mb-3">
                <label class="form-label">Caption</label>
                <textarea 
                  v-model="documentForm.caption" 
                  class="form-control" 
                  rows="2"
                  placeholder="Deskripsi foto/dokumen"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-danger" @click="handleDocumentUpload" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Certificate Upload Modal -->
    <div class="modal fade" id="certificateModal" tabindex="-1" ref="certificateModalElement">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Upload Sertifikat</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleCertificateUpload">
              <div class="mb-3">
                <label class="form-label">File Sertifikat <span class="text-danger">*</span></label>
                <input 
                  ref="certificateFileInput"
                  type="file" 
                  class="form-control"
                  accept="image/*,application/pdf"
                  @change="handleCertificateFileSelect"
                >
                <small class="text-muted">Format: JPG, PNG, PDF. Maksimal 5MB.</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-danger" @click="handleCertificateUpload" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import achievementsService from '../services/achievementsService'
import studentsService from '../../../shared/services/studentsService'
import teachersService from '../services/teachersService'
import { useAuthStore } from '../../auth/store/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(false)
const saving = ref(false)
const activeTab = ref('participants')
const achievement = ref({})
const participants = ref([])
const documents = ref([])
const students = ref([])
const teachers = ref([])
const showExportDropdown = ref(false)
const exportDropdownRef = ref(null)

// Modals
const participantModalElement = ref(null)
const resultModalElement = ref(null)
const documentModalElement = ref(null)
const certificateModalElement = ref(null)
const achievementModalElement = ref(null)
let participantModal = null
let resultModal = null
let documentModal = null
let certificateModal = null
let achievementModal = null

// Forms
const participantForm = ref({
  type: '',
  student_id: null,
  teacher_id: null,
  role: '',
  notes: ''
})

const resultForm = ref({
  id: null,
  participant_id: null,
  rank: '',
  category: '',
  score: '',
  notes: ''
})

const documentForm = ref({
  caption: '',
  file: null
})

const certificateForm = ref({
  participant: null,
  result: null,
  file: null
})

const documentFileInput = ref(null)
const certificateFileInput = ref(null)

// Search queries for filtering
const studentSearchQuery = ref('')
const teacherSearchQuery = ref('')

// Achievement edit form state
const achievementForm = ref({
  id: null,
  title: '',
  event_type: '',
  level: '',
  organizer: '',
  location: '',
  event_date: '',
  description: ''
})

const achievementErrors = ref({})

// Computed
const totalResults = computed(() => {
  return participants.value.filter(p => getParticipantResult(p)).length
})

const filteredStudents = computed(() => {
  if (!studentSearchQuery.value) return students.value
  
  const query = studentSearchQuery.value.toLowerCase()
  return students.value.filter(student => 
    student.name?.toLowerCase().includes(query) || 
    student.nis?.toLowerCase().includes(query)
  )
})

const filteredTeachers = computed(() => {
  if (!teacherSearchQuery.value) return teachers.value
  
  const query = teacherSearchQuery.value.toLowerCase()
  return teachers.value.filter(teacher => 
    teacher.name?.toLowerCase().includes(query) || 
    teacher.nip?.toLowerCase().includes(query)
  )
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    const achievementId = route.params.id
    const schoolId = authStore.user?.school_id

    const [achievementRes, studentsRes, teachersRes] = await Promise.all([
      achievementsService.getById(achievementId),
      studentsService.getAll(schoolId),
      teachersService.getAll(schoolId)
    ])

    // Handle different response structures
    const achievementData = achievementRes.data || achievementRes
    
    achievement.value = achievementData
    
    // Ensure participants and documents are arrays
    participants.value = Array.isArray(achievementData.participants) 
      ? achievementData.participants 
      : []
    
    documents.value = Array.isArray(achievementData.documents) 
      ? achievementData.documents 
      : []
    
    students.value = Array.isArray(studentsRes) ? studentsRes : (studentsRes.data || [])
    teachers.value = Array.isArray(teachersRes) ? teachersRes : (teachersRes.data || [])
    
    console.log('Achievement loaded:', achievementData)
    console.log('Participants:', participants.value)
    console.log('Documents:', documents.value)
  } catch (error) {
    console.error('Failed to load data:', error)
    alert('Gagal memuat data: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/admin/achievements')
}

const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value
}

const editAchievement = () => {
  // Prefill achievementForm from loaded achievement and open modal
  achievementForm.value = {
    id: achievement.value.id,
    title: achievement.value.title || '',
    event_type: achievement.value.event_type || '',
    level: achievement.value.level || '',
    organizer: achievement.value.organizer || '',
    location: achievement.value.location || '',
    event_date: achievement.value.event_date ? achievement.value.event_date.split('T')[0] : '',
    description: achievement.value.description || ''
  }
  achievementErrors.value = {}
  achievementModal.show()
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
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

const getParticipantName = (participant) => {
  if (participant.student) {
    return participant.student.name
  }
  if (participant.teacher) {
    return participant.teacher.name
  }
  return 'Unknown'
}

const getParticipantType = (participant) => {
  if (participant.student) {
    return `Siswa - ${participant.student.nis || ''}`
  }
  if (participant.teacher) {
    return `Guru - ${participant.teacher.nip || ''}`
  }
  return 'Unknown'
}

// Helper to get first result (since results is an array)
const getParticipantResult = (participant) => {
  if (participant.results && Array.isArray(participant.results) && participant.results.length > 0) {
    return participant.results[0]
  }
  return null
}

// Participant CRUD
const openParticipantModal = () => {
  participantForm.value = {
    type: '',
    student_id: null,
    teacher_id: null,
    role: '',
    notes: ''
  }
  studentSearchQuery.value = ''
  teacherSearchQuery.value = ''
  participantModal.show()
}

const clearParticipantSelection = () => {
  participantForm.value.student_id = null
  participantForm.value.teacher_id = null
  studentSearchQuery.value = ''
  teacherSearchQuery.value = ''
}

const selectStudent = (studentId) => {
  participantForm.value.student_id = studentId
}

const selectTeacher = (teacherId) => {
  participantForm.value.teacher_id = teacherId
}

const handleParticipantSubmit = async () => {
  if (!participantForm.value.type || !participantForm.value.role) {
    alert('Tipe peserta dan peran wajib diisi')
    return
  }

  if (participantForm.value.type === 'student' && !participantForm.value.student_id) {
    alert('Pilih siswa terlebih dahulu')
    return
  }

  if (participantForm.value.type === 'teacher' && !participantForm.value.teacher_id) {
    alert('Pilih guru terlebih dahulu')
    return
  }

  saving.value = true
  try {
    const payload = {
      student_id: participantForm.value.type === 'student' ? participantForm.value.student_id : null,
      teacher_id: participantForm.value.type === 'teacher' ? participantForm.value.teacher_id : null,
      role: participantForm.value.role,
      notes: participantForm.value.notes
    }

    const response = await achievementsService.addParticipant(route.params.id, payload)
    console.log('Add participant response:', response)
    alert('Peserta berhasil ditambahkan')
    participantModal.hide()
    await loadData()
  } catch (error) {
    console.error('Failed to add participant:', error)
    alert('Gagal menambah peserta: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

const deleteParticipant = async (participant) => {
  if (!confirm(`Hapus peserta ${getParticipantName(participant)}?`)) return

  try {
    await achievementsService.deleteParticipant(route.params.id, participant.id)
    alert('Peserta berhasil dihapus')
    await loadData()
  } catch (error) {
    console.error('Failed to delete participant:', error)
    alert('Gagal menghapus peserta: ' + (error.response?.data?.message || error.message))
  }
}

// Result CRUD
const openResultModal = (participant) => {
  const result = getParticipantResult(participant)
  if (result) {
    resultForm.value = {
      id: result.id,
      participant_id: participant.id,
      rank: result.rank || '',
      category: result.category || '',
      score: result.score || '',
      notes: result.notes || ''
    }
  } else {
    resultForm.value = {
      id: null,
      participant_id: participant.id,
      rank: '',
      category: '',
      score: '',
      notes: ''
    }
  }
  resultModal.show()
}

const handleResultSubmit = async () => {
  if (!resultForm.value.rank) {
    alert('Prestasi/peringkat wajib diisi')
    return
  }

  saving.value = true
  try {
    const payload = {
      rank: resultForm.value.rank,
      category: resultForm.value.category,
      score: resultForm.value.score,
      notes: resultForm.value.notes
    }

    if (resultForm.value.id) {
      const response = await achievementsService.updateResult(
        route.params.id, 
        resultForm.value.participant_id, 
        resultForm.value.id,
        payload
      )
      console.log('Update result response:', response)
      alert('Hasil berhasil diperbarui')
    } else {
      const response = await achievementsService.addResult(
        route.params.id, 
        resultForm.value.participant_id, 
        payload
      )
      console.log('Add result response:', response)
      alert('Hasil berhasil ditambahkan')
    }

    resultModal.hide()
    await loadData()
  } catch (error) {
    console.error('Failed to save result:', error)
    alert('Gagal menyimpan hasil: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

// Certificate Upload
const openCertificateUpload = (participant) => {
  const result = getParticipantResult(participant)
  if (!result) {
    alert('Tambahkan hasil prestasi terlebih dahulu')
    return
  }
  certificateForm.value = {
    participant: participant,
    result: result,
    file: null
  }
  certificateModal.show()
}

const handleCertificateFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && file.size > 5 * 1024 * 1024) {
    alert('Ukuran file maksimal 5MB')
    certificateFileInput.value.value = ''
    return
  }
  certificateForm.value.file = file
}

const handleCertificateUpload = async () => {
  if (!certificateForm.value.file) {
    alert('Pilih file terlebih dahulu')
    return
  }

  saving.value = true
  try {
    const formData = new FormData()
    formData.append('certificate', certificateForm.value.file)

    const response = await achievementsService.uploadCertificate(
      route.params.id,
      certificateForm.value.participant.id,
      certificateForm.value.result.id,
      formData
    )
    console.log('Upload certificate response:', response)

    alert('Sertifikat berhasil diupload')
    certificateModal.hide()
    await loadData()
  } catch (error) {
    console.error('Failed to upload certificate:', error)
    alert('Gagal upload sertifikat: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

const deleteCertificate = async (participant) => {
  if (!confirm('Hapus sertifikat?')) return

  const result = getParticipantResult(participant)
  if (!result) {
    alert('Tidak ada hasil untuk dihapus')
    return
  }

  try {
    await achievementsService.deleteCertificate(
      route.params.id,
      participant.id,
      result.id
    )
    alert('Sertifikat berhasil dihapus')
    await loadData()
  } catch (error) {
    console.error('Failed to delete certificate:', error)
    alert('Gagal menghapus sertifikat: ' + (error.response?.data?.message || error.message))
  }
}

// Document Upload
const openDocumentUpload = () => {
  documentForm.value = {
    caption: '',
    file: null
  }
  if (documentFileInput.value) {
    documentFileInput.value.value = ''
  }
  documentModal.show()
}

const handleDocumentFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && file.size > 5 * 1024 * 1024) {
    alert('Ukuran file maksimal 5MB')
    documentFileInput.value.value = ''
    return
  }
  documentForm.value.file = file
}

const handleDocumentUpload = async () => {
  if (!documentForm.value.file) {
    alert('Pilih file terlebih dahulu')
    return
  }

  saving.value = true
  try {
    const formData = new FormData()
    formData.append('file', documentForm.value.file)
    formData.append('caption', documentForm.value.caption)
    formData.append('file_type', documentForm.value.file.type.startsWith('image/') ? 'image' : 'document')

    const response = await achievementsService.uploadDocument(route.params.id, formData)
    console.log('Upload document response:', response)
    alert('Dokumentasi berhasil diupload')
    documentModal.hide()
    await loadData()
  } catch (error) {
    console.error('Failed to upload document:', error)
    alert('Gagal upload dokumentasi: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

const deleteDocument = async (doc) => {
  if (!confirm('Hapus dokumentasi ini?')) return

  try {
    await achievementsService.deleteDocument(route.params.id, doc.id)
    alert('Dokumentasi berhasil dihapus')
    await loadData()
  } catch (error) {
    console.error('Failed to delete document:', error)
    alert('Gagal menghapus dokumentasi: ' + (error.response?.data?.message || error.message))
  }
}

const isImage = (filePath) => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath)
}

const viewImage = (url) => {
  window.open(url, '_blank')
}

// Export Functions
const exportToExcel = () => {
  showExportDropdown.value = false
  try {
    // Prepare data for export
    const exportData = []
    
    // Add header info
    exportData.push(['LAPORAN PRESTASI'])
    exportData.push([''])
    exportData.push(['Judul Kegiatan', achievement.value.title])
    exportData.push(['Jenis Kegiatan', achievement.value.event_type])
    exportData.push(['Tingkat', achievement.value.level])
    exportData.push(['Penyelenggara', achievement.value.organizer || '-'])
    exportData.push(['Lokasi', achievement.value.location || '-'])
    exportData.push(['Tanggal Kegiatan', formatDate(achievement.value.event_date)])
    exportData.push(['Deskripsi', achievement.value.description || '-'])
    exportData.push([''])
    exportData.push(['DAFTAR PESERTA DAN HASIL'])
    exportData.push(['No', 'Nama Peserta', 'Tipe', 'NIS/NIP', 'Peran', 'Kategori', 'Prestasi', 'Skor', 'Catatan'])
    
    // Add participant data
    participants.value.forEach((participant, index) => {
      const result = getParticipantResult(participant)
      const name = getParticipantName(participant)
      const type = participant.student ? 'Siswa' : 'Guru'
      const identifier = participant.student ? participant.student.nis : participant.teacher?.nip || '-'
      
      exportData.push([
        index + 1,
        name,
        type,
        identifier,
        participant.role,
        result?.category || '-',
        result?.rank || '-',
        result?.score || '-',
        result?.notes || '-'
      ])
    })
    
    // Add summary
    exportData.push([''])
    exportData.push(['RINGKASAN'])
    exportData.push(['Total Peserta', participants.value.length])
    exportData.push(['Total Prestasi', totalResults.value])
    exportData.push(['Total Dokumentasi', documents.value.length])
    
    // Convert to CSV
    const csv = exportData.map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma or newline
        const cellStr = String(cell || '')
        if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      }).join(',')
    ).join('\n')
    
    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    const fileName = `Prestasi_${achievement.value.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    alert('Data berhasil diexport ke Excel/CSV')
  } catch (error) {
    console.error('Export failed:', error)
    alert('Gagal export data: ' + error.message)
  }
}

const exportToPDF = () => {
  showExportDropdown.value = false
  try {
    // Build HTML parts
    const htmlHeader = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Laporan Prestasi - ' + achievement.value.title + '</title>'
    const styles = '<style>body{font-family:Arial,sans-serif;padding:40px}h1{color:#dc2626;border-bottom:3px solid #dc2626;padding-bottom:10px}h2{color:#374151;margin-top:30px}.info-table{width:100%;margin:20px 0}.info-table td{padding:8px;border-bottom:1px solid #e5e7eb}.info-table td:first-child{font-weight:bold;width:200px}table{width:100%;border-collapse:collapse;margin:20px 0}th{background-color:#dc2626;color:white;padding:12px;text-align:left}td{padding:10px;border-bottom:1px solid #ddd}tr:hover{background-color:#f9fafb}.summary{background-color:#f3f4f6;padding:20px;border-radius:8px;margin-top:30px}.badge{display:inline-block;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:bold}.badge-warning{background-color:#fef3c7;color:#92400e}@media print{body{padding:20px}button{display:none}}</style></head><body>'
    
    let html = htmlHeader + styles
    html += '<h1>LAPORAN PRESTASI</h1>'
    html += '<table class="info-table">'
    html += '<tr><td>Judul Kegiatan</td><td>' + achievement.value.title + '</td></tr>'
    html += '<tr><td>Jenis Kegiatan</td><td>' + achievement.value.event_type + '</td></tr>'
    html += '<tr><td>Tingkat</td><td>' + achievement.value.level + '</td></tr>'
    html += '<tr><td>Penyelenggara</td><td>' + (achievement.value.organizer || '-') + '</td></tr>'
    html += '<tr><td>Lokasi</td><td>' + (achievement.value.location || '-') + '</td></tr>'
    html += '<tr><td>Tanggal Kegiatan</td><td>' + formatDate(achievement.value.event_date) + '</td></tr>'
    html += '<tr><td>Deskripsi</td><td>' + (achievement.value.description || '-') + '</td></tr>'
    html += '</table>'
    
    html += '<h2>DAFTAR PESERTA DAN HASIL</h2>'
    html += '<table><thead><tr><th>No</th><th>Nama Peserta</th><th>Tipe</th><th>NIS/NIP</th><th>Peran</th><th>Kategori</th><th>Prestasi</th><th>Skor</th></tr></thead><tbody>'
    
    participants.value.forEach((participant, index) => {
      const result = getParticipantResult(participant)
      const name = getParticipantName(participant)
      const type = participant.student ? 'Siswa' : 'Guru'
      const identifier = participant.student ? participant.student.nis : participant.teacher?.nip || '-'
      
      html += '<tr>'
      html += '<td>' + (index + 1) + '</td>'
      html += '<td><strong>' + name + '</strong></td>'
      html += '<td>' + type + '</td>'
      html += '<td>' + identifier + '</td>'
      html += '<td>' + participant.role + '</td>'
      html += '<td>' + (result?.category || '-') + '</td>'
      html += '<td>' + (result ? '<span class="badge badge-warning">' + result.rank + '</span>' : '-') + '</td>'
      html += '<td>' + (result?.score || '-') + '</td>'
      html += '</tr>'
    })
    
    html += '</tbody></table>'
    html += '<div class="summary"><h2>RINGKASAN</h2><table class="info-table">'
    html += '<tr><td>Total Peserta</td><td><strong>' + participants.value.length + ' orang</strong></td></tr>'
    html += '<tr><td>Total Prestasi</td><td><strong>' + totalResults.value + ' prestasi</strong></td></tr>'
    html += '<tr><td>Total Dokumentasi</td><td><strong>' + documents.value.length + ' file</strong></td></tr>'
    html += '</table></div>'
    html += '<div style="margin-top:40px;text-align:center;color:#6b7280;font-size:12px">'
    html += '<p>Dicetak pada: ' + new Date().toLocaleString('id-ID') + '</p></div>'
    html += '<' + 'script>window.onload=function(){window.print()}<' + '/script>'
    html += '<' + '/body><' + '/html>'
    
    // Open in new window and print
    const printWindow = window.open('', '_blank')
    printWindow.document.write(html)
    printWindow.document.close()
    
  } catch (error) {
    console.error('Export PDF failed:', error)
    alert('Gagal export PDF: ' + error.message)
  }
}

const validateAchievementForm = () => {
  achievementErrors.value = {}
  if (!achievementForm.value.title?.trim()) achievementErrors.value.title = 'Judul kegiatan wajib diisi'
  if (!achievementForm.value.event_type) achievementErrors.value.event_type = 'Jenis kegiatan wajib diisi'
  if (!achievementForm.value.level) achievementErrors.value.level = 'Tingkat wajib diisi'
  if (!achievementForm.value.event_date) achievementErrors.value.event_date = 'Tanggal kegiatan wajib diisi'
  return Object.keys(achievementErrors.value).length === 0
}

const handleAchievementSubmit = async () => {
  if (!validateAchievementForm()) return
  saving.value = true
  try {
    const payload = {
      title: achievementForm.value.title,
      event_type: achievementForm.value.event_type,
      level: achievementForm.value.level,
      organizer: achievementForm.value.organizer,
      location: achievementForm.value.location,
      event_date: achievementForm.value.event_date,
      description: achievementForm.value.description
    }

    await achievementsService.update(route.params.id || achievementForm.value.id, payload)
    alert('Prestasi berhasil diperbarui')
    achievementModal.hide()
    await loadData()
  } catch (error) {
    console.error('Failed to update achievement:', error)
    alert('Gagal memperbarui prestasi: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  participantModal = new Modal(participantModalElement.value)
  resultModal = new Modal(resultModalElement.value)
  documentModal = new Modal(documentModalElement.value)
  certificateModal = new Modal(certificateModalElement.value)
  achievementModal = new Modal(achievementModalElement.value)
  loadData()
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (exportDropdownRef.value && !exportDropdownRef.value.contains(e.target)) {
      showExportDropdown.value = false
    }
  })
})
</script>

<style scoped>
.achievement-detail-page {
  padding: 20px;
}

.nav-tabs .nav-link {
  color: #666;
}

.nav-tabs .nav-link.active {
  color: #dc2626;
  border-bottom-color: #dc2626;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.doc-thumbnail {
  height: 150px;
  object-fit: cover;
}

.doc-placeholder {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  font-size: 3rem;
  color: #adb5bd;
}

.card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Statistics Cards Styling */
.statistics-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card-primary {
  border-left: 4px solid #3b82f6;
}

.stat-card-success {
  border-left: 4px solid #10b981;
}

.stat-card-info {
  border-left: 4px solid #06b6d4;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 16px;
  flex-shrink: 0;
}

.stat-card-primary .stat-icon {
  background: #dbeafe;
  color: #3b82f6;
}

.stat-card-success .stat-icon {
  background: #d1fae5;
  color: #10b981;
}

.stat-card-info .stat-icon {
  background: #cffafe;
  color: #06b6d4;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

/* Select List Styling */
.select-list-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: #fff;
}

.select-list-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.15s;
}

.select-list-item:last-child {
  border-bottom: none;
}

.select-list-item:hover {
  background-color: #f9fafb;
}

.select-list-item.active {
  background-color: #dbeafe;
  border-left: 3px solid #3b82f6;
}

.select-list-empty {
  padding: 24px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}

/* Custom scrollbar for select list */
.select-list-container::-webkit-scrollbar {
  width: 6px;
}

.select-list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.select-list-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.select-list-container::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
