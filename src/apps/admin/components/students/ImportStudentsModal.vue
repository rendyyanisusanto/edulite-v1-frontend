<template>
  <div
    class="modal fade"
    id="importStudentsModal"
    tabindex="-1"
    aria-labelledby="importStudentsModalLabel"
    aria-hidden="true"
    ref="modalRef"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="importStudentsModalLabel">
            <i class="bi bi-file-earmark-excel me-2"></i>Import Siswa dari Excel
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <!-- Instructions -->
          <div class="alert alert-info">
            <h6 class="alert-heading">
              <i class="bi bi-info-circle me-2"></i>Petunjuk Import
            </h6>
            <ol class="mb-2">
              <li>Download template Excel terlebih dahulu (template sudah berisi school_id Anda)</li>
              <li>Isi data siswa sesuai format template</li>
              <li>Upload file Excel yang sudah diisi</li>
              <li>Sistem akan memproses data secara batch untuk performa optimal</li>
            </ol>
            <div class="alert alert-warning mb-0 mt-2">
              <small>
                <strong>Penting:</strong> Pastikan ID yang digunakan (school_id, grade_id, class_id, dll) sudah ada di sistem.
                Template yang didownload sudah berisi school_id yang sesuai dengan akun Anda.
              </small>
            </div>
          </div>

          <!-- Select Class -->
          <div class="mb-4">
            <label class="form-label fw-bold">Pilih Kelas</label>
            <select
              class="form-select"
              v-model="selectedClassId"
              :disabled="isImporting"
            >
              <option value="">-- Pilih Kelas --</option>
              <option
                v-for="classItem in classes"
                :key="classItem.id"
                :value="classItem.id"
              >
                {{ classItem.grade?.name }} - {{ classItem.name }}
              </option>
            </select>
            <small class="text-muted">
              Siswa yang diimport akan ditambahkan ke kelas yang dipilih
            </small>
          </div>

          <!-- Download Template -->
          <div class="mb-4">
            <button
              @click="downloadTemplate"
              class="btn btn-success"
              :disabled="isDownloading || !selectedClassId"
            >
              <i class="bi bi-download me-2"></i>
              {{ isDownloading ? 'Downloading...' : 'Download Template Excel' }}
            </button>
            <small class="d-block text-muted mt-2">
              Template akan disesuaikan dengan kelas yang dipilih
            </small>
          </div>

          <!-- File Upload -->
          <div class="mb-3">
            <label class="form-label fw-bold">Upload File Excel</label>
            <div
              class="upload-area"
              :class="{ 'drag-over': isDragOver }"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="handleDrop"
            >
              <input
                type="file"
                ref="fileInput"
                @change="handleFileSelect"
                accept=".xlsx,.xls"
                class="d-none"
              />
              
              <div v-if="!selectedFile" class="text-center py-4">
                <i class="bi bi-cloud-upload fs-1 text-muted"></i>
                <p class="mt-3 mb-2">
                  Drag & drop file Excel atau
                  <a href="#" @click.prevent="$refs.fileInput.click()" class="text-primary">
                    klik untuk browse
                  </a>
                </p>
                <small class="text-muted">File Excel (.xlsx, .xls) - Max 10MB</small>
              </div>

              <div v-else class="selected-file">
                <i class="bi bi-file-earmark-excel text-success fs-1"></i>
                <div class="ms-3 flex-grow-1">
                  <h6 class="mb-1">{{ selectedFile.name }}</h6>
                  <small class="text-muted">{{ formatFileSize(selectedFile.size) }}</small>
                </div>
                <button
                  @click="removeFile"
                  class="btn btn-sm btn-outline-danger"
                  type="button"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Import Progress -->
          <div v-if="isImporting" class="mb-3">
            <div class="d-flex align-items-center">
              <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <span>Mengimpor data siswa...</span>
            </div>
          </div>

          <!-- Import Results -->
          <div v-if="importResults" class="alert" :class="importResults.errors > 0 ? 'alert-warning' : 'alert-success'">
            <h6 class="alert-heading">
              <i class="bi" :class="importResults.errors > 0 ? 'bi-exclamation-triangle' : 'bi-check-circle'"></i>
              Hasil Import
            </h6>
            <div class="row">
              <div class="col-md-4">
                <strong>Total:</strong> {{ importResults.total }}
              </div>
              <div class="col-md-4">
                <strong class="text-success">Berhasil:</strong> {{ importResults.success }}
              </div>
              <div class="col-md-4">
                <strong class="text-danger">Gagal:</strong> {{ importResults.errors }}
              </div>
            </div>

            <!-- Error Details -->
            <div v-if="importResults.errorDetails && importResults.errorDetails.length > 0" class="mt-3">
              <button
                class="btn btn-sm btn-outline-danger"
                @click="showErrors = !showErrors"
              >
                <i class="bi" :class="showErrors ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                {{ showErrors ? 'Sembunyikan' : 'Tampilkan' }} Detail Error
              </button>

              <div v-if="showErrors" class="mt-2" style="max-height: 200px; overflow-y: auto;">
                <table class="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Baris</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(error, index) in importResults.errorDetails" :key="index">
                      <td>{{ error.row }}</td>
                      <td class="text-danger">{{ error.error }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
            :disabled="isImporting"
          >
            {{ importResults ? 'Tutup' : 'Batal' }}
          </button>
          <button
            v-if="!importResults"
            type="button"
            class="btn btn-primary"
            @click="handleImport"
            :disabled="!selectedFile || isImporting || !selectedClassId"
          >
            <i class="bi bi-upload me-2"></i>
            {{ isImporting ? 'Mengimpor...' : 'Import Data' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import studentService from '../../services/studentService'

const emit = defineEmits(['imported'])

const modalRef = ref(null)
const fileInput = ref(null)
const selectedFile = ref(null)
const selectedClassId = ref('')
const classes = ref([])
const isDragOver = ref(false)
const isImporting = ref(false)
const isDownloading = ref(false)
const importResults = ref(null)
const showErrors = ref(false)

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

const handleDrop = (event) => {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

const validateAndSetFile = (file) => {
  // Check file type
  const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
  if (!validTypes.includes(file.type)) {
    alert('File harus berformat Excel (.xlsx atau .xls)')
    return
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('Ukuran file maksimal 10MB')
    return
  }

  selectedFile.value = file
  importResults.value = null // Reset results when new file selected
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  importResults.value = null
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const fetchClasses = async () => {
  try {
    const response = await studentService.getClasses()
    classes.value = response.data
  } catch (error) {
    console.error('Error fetching classes:', error)
    alert('Gagal memuat data kelas')
  }
}

const downloadTemplate = async () => {
  if (!selectedClassId.value) {
    alert('Pilih kelas terlebih dahulu')
    return
  }

  try {
    isDownloading.value = true
    const blob = await studentService.downloadTemplate(selectedClassId.value)

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'template_import_siswa.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading template:', error)
    alert('Gagal mendownload template: ' + (error.response?.data?.message || error.message))
  } finally {
    isDownloading.value = false
  }
}

const handleImport = async () => {
  if (!selectedFile.value) {
    alert('Pilih file Excel terlebih dahulu')
    return
  }

  if (!selectedClassId.value) {
    alert('Pilih kelas terlebih dahulu')
    return
  }

  try {
    isImporting.value = true
    const response = await studentService.importFromExcel(selectedFile.value, selectedClassId.value)

    importResults.value = response.results

    if (response.results.errors === 0) {
      alert('Import berhasil! ' + response.results.success + ' siswa telah ditambahkan.')
      emit('imported')
    } else {
      alert('Import selesai dengan beberapa error. Periksa detail error di bawah.')
    }
  } catch (error) {
    console.error('Error importing students:', error)
    const errorData = error.response?.data
    let errorMsg = 'Gagal mengimpor data: ' + (errorData?.message || error.message)

    if (errorData?.error) {
      errorMsg += '\n\n' + errorData.error
    }

    if (errorData?.hint) {
      errorMsg += '\n\n💡 ' + errorData.hint
    }

    alert(errorMsg)
  } finally {
    isImporting.value = false
  }
}

const show = () => {
  fetchClasses()
  const modal = new Modal(modalRef.value)
  modal.show()
}

const hide = () => {
  const modal = Modal.getInstance(modalRef.value)
  if (modal) {
    modal.hide()
  }
  // Reset state
  removeFile()
  selectedClassId.value = ''
  importResults.value = null
  showErrors.value = false
}

defineExpose({ show, hide })
</script>

<style scoped>
.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 20px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #0d6efd;
  background-color: #e7f1ff;
}

.upload-area.drag-over {
  border-color: #0d6efd;
  background-color: #e7f1ff;
}

.selected-file {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
}
</style>
