<template>
  <div class="student-documents-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <i class="bi bi-file-earmark-text"></i>
            Dokumen Siswa
          </h1>
          <p class="page-subtitle">Kelola dokumen administrasi siswa</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" @click="showAddModal">
            <i class="bi bi-plus-lg"></i>
            Tambah Dokumen
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Siswa</label>
          <select v-model="filters.student_id" class="form-select" @change="fetchDocuments">
            <option value="">Semua Siswa</option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.name }} - {{ student.nisn }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Jenis Dokumen</label>
          <select v-model="filters.document_type_id" class="form-select" @change="fetchDocuments">
            <option value="">Semua Jenis</option>
            <option v-for="type in documentTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Cari</label>
          <div class="input-group">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Cari nama siswa, nomor dokumen..."
              @input="handleSearch"
            />
            <button class="btn btn-outline-secondary" @click="clearFilters">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-row" v-if="statistics">
      <div class="stat-card">
        <div class="stat-icon bg-primary">
          <i class="bi bi-files"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.total }}</div>
          <div class="stat-label">Total Dokumen</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-success">
          <i class="bi bi-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.withFile }}</div>
          <div class="stat-label">Sudah Upload</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-warning">
          <i class="bi bi-exclamation-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.withoutFile }}</div>
          <div class="stat-label">Belum Upload</div>
        </div>
      </div>
    </div>

    <!-- Documents Table -->
    <div class="table-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>Memuat data...</p>
      </div>

      <div v-else-if="documents.length === 0" class="empty-state">
        <i class="bi bi-inbox"></i>
        <h5>Tidak ada dokumen</h5>
        <p>Belum ada dokumen siswa yang terdaftar</p>
        <button class="btn btn-primary" @click="showAddModal">
          <i class="bi bi-plus-lg"></i>
          Tambah Dokumen Pertama
        </button>
      </div>

      <div v-else class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Siswa</th>
              <th>Jenis Dokumen</th>
              <th>No. Dokumen</th>
              <th>Tanggal Terbit</th>
              <th>File</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in documents" :key="doc.id">
              <td>
                <div class="student-info">
                  <div class="student-name">{{ doc.student?.name }}</div>
                  <small class="text-muted">{{ doc.student?.nisn }}</small>
                </div>
              </td>
              <td>
                <div class="doc-type">
                  {{ doc.documentTypeInfo?.name || doc.document_type }}
                  <span v-if="doc.documentTypeInfo?.required" class="badge bg-danger ms-1">
                    Wajib
                  </span>
                </div>
              </td>
              <td>{{ doc.document_number || '-' }}</td>
              <td>{{ formatDate(doc.issued_date) }}</td>
              <td>
                <div v-if="doc.document_file">
                  <a :href="doc.document_file" target="_blank" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-eye"></i>
                    Lihat File
                  </a>
                </div>
                <div v-else>
                  <button class="btn btn-sm btn-outline-warning" @click="showUploadModal(doc)">
                    <i class="bi bi-upload"></i>
                    Upload
                  </button>
                </div>
              </td>
              <td>
                <span v-if="doc.document_file" class="badge bg-success">
                  <i class="bi bi-check-circle"></i>
                  Lengkap
                </span>
                <span v-else class="badge bg-warning">
                  <i class="bi bi-exclamation-circle"></i>
                  Belum Upload
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    class="btn btn-sm btn-outline-primary"
                    @click="showEditModal(doc)"
                    title="Edit"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    v-if="doc.document_file"
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDeleteFile(doc)"
                    title="Hapus File"
                  >
                    <i class="bi bi-file-x"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(doc)"
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
      <div v-if="pagination && pagination.totalPages > 1" class="pagination-wrapper">
        <nav>
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: !pagination.hasPrevPage }">
              <button class="page-link" @click="changePage(pagination.page - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li
              v-for="page in getPageNumbers()"
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

    <!-- Add/Edit Modal -->
    <DocumentFormModal
      v-if="showModal"
      :document="selectedDocument"
      :students="students"
      :document-types="documentTypes"
      @close="closeModal"
      @saved="handleSaved"
    />

    <!-- Upload Modal -->
    <UploadFileModal
      v-if="showUpload"
      :document="selectedDocument"
      @close="closeUploadModal"
      @uploaded="handleUploaded"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import studentDocumentService from '../services/studentDocumentService'
import studentService from '../services/studentService'
import DocumentFormModal from '../components/documents/DocumentFormModal.vue'
import UploadFileModal from '../components/documents/UploadFileModal.vue'

const router = useRouter()
const route = useRoute()

const documents = ref([])
const students = ref([])
const documentTypes = ref([])
const statistics = ref(null)
const loading = ref(false)
const pagination = ref(null)
const searchQuery = ref('')
const filters = ref({
  student_id: '',
  document_type_id: '',
  page: 1,
  limit: 10
})

const showModal = ref(false)
const showUpload = ref(false)
const selectedDocument = ref(null)

// Fetch documents
const fetchDocuments = async () => {
  try {
    loading.value = true
    const response = await studentDocumentService.getAll(filters.value)
    documents.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Error fetching documents:', error)
    alert('Error: Gagal memuat data dokumen')
  } finally {
    loading.value = false
  }
}

// Fetch students
const fetchStudents = async () => {
  try {
    const response = await studentService.getAll({ limit: 1000 })
    students.value = response.data
  } catch (error) {
    console.error('Error fetching students:', error)
  }
}

// Fetch document types
const fetchDocumentTypes = async () => {
  try {
    const response = await studentDocumentService.getAllTypes({ limit: 100 })
    documentTypes.value = response.data
  } catch (error) {
    console.error('Error fetching document types:', error)
  }
}

// Fetch statistics
const fetchStatistics = async () => {
  try {
    const response = await studentDocumentService.getStatistics(filters.value)
    statistics.value = response.data
  } catch (error) {
    console.error('Error fetching statistics:', error)
  }
}

// Search handler
let searchTimeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.page = 1
    fetchDocuments()
  }, 500)
}

// Clear filters
const clearFilters = () => {
  filters.value = {
    student_id: '',
    document_type_id: '',
    page: 1,
    limit: 10
  }
  searchQuery.value = ''
  fetchDocuments()
  fetchStatistics()
}

// Pagination
const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    filters.value.page = page
    fetchDocuments()
  }
}

const getPageNumbers = () => {
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
}

// Modal handlers
const showAddModal = () => {
  selectedDocument.value = null
  showModal.value = true
}

const showEditModal = (doc) => {
  selectedDocument.value = doc
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedDocument.value = null
}

const handleSaved = () => {
  closeModal()
  fetchDocuments()
  fetchStatistics()
}

const showUploadModal = (doc) => {
  selectedDocument.value = doc
  showUpload.value = true
}

const closeUploadModal = () => {
  showUpload.value = false
  selectedDocument.value = null
}

const handleUploaded = () => {
  closeUploadModal()
  fetchDocuments()
  fetchStatistics()
}

// Delete document
const confirmDelete = async (doc) => {
  if (confirm(`Apakah Anda yakin ingin menghapus dokumen ${doc.document_type}?`)) {
    try {
      await studentDocumentService.delete(doc.id)
      alert('Dokumen berhasil dihapus')
      fetchDocuments()
      fetchStatistics()
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Error: Gagal menghapus dokumen')
    }
  }
}

// Delete file only
const confirmDeleteFile = async (doc) => {
  if (confirm('Apakah Anda yakin ingin menghapus file dokumen ini?')) {
    try {
      await studentDocumentService.deleteFile(doc.id)
      alert('File dokumen berhasil dihapus')
      fetchDocuments()
      fetchStatistics()
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error: Gagal menghapus file')
    }
  }
}

// Format date
const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  // Check if there's a student_id in query params
  if (route.query.student_id) {
    filters.value.student_id = route.query.student_id
  }
  
  fetchDocuments()
  fetchStudents()
  fetchDocumentTypes()
  fetchStatistics()
})
</script>

<style scoped>
.student-documents-page {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title i {
  color: #dc2626;
}

.page-subtitle {
  color: #64748b;
  margin: 4px 0 0 0;
  font-size: 14px;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

.table-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-state i {
  font-size: 64px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.table {
  margin-bottom: 0;
}

.table thead th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
  padding: 12px 16px;
}

.table tbody td {
  padding: 16px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}

.student-info {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 600;
  color: #1e293b;
}

.doc-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination-wrapper {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .table-responsive {
    overflow-x: auto;
  }
}
</style>
