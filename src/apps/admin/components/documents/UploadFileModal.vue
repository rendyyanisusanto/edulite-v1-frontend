<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-upload"></i>
            Upload Dokumen
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="document-info">
              <h6>Informasi Dokumen</h6>
              <div class="info-row">
                <span class="label">Siswa:</span>
                <span class="value">{{ document.student?.name }}</span>
              </div>
              <div class="info-row">
                <span class="label">Jenis:</span>
                <span class="value">{{ document.documentTypeInfo?.name || document.document_type }}</span>
              </div>
            </div>

            <div class="upload-area" :class="{ 'has-file': file }">
              <input
                ref="fileInput"
                type="file"
                class="file-input"
                @change="handleFileChange"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                required
              />

              <div v-if="!file" class="upload-placeholder" @click="triggerFileInput">
                <i class="bi bi-cloud-upload"></i>
                <p class="upload-text">Klik atau drag & drop file disini</p>
                <p class="upload-hint">PDF, JPG, PNG, DOC, DOCX (Maks. 10MB)</p>
              </div>

              <div v-else class="file-preview">
                <i class="bi bi-file-earmark-check file-icon"></i>
                <div class="file-info">
                  <p class="file-name">{{ file.name }}</p>
                  <p class="file-size">{{ formatFileSize(file.size) }}</p>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger" @click="removeFile">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
              <div class="progress">
                <div
                  class="progress-bar progress-bar-striped progress-bar-animated"
                  :style="{ width: uploadProgress + '%' }"
                >
                  {{ uploadProgress }}%
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')" :disabled="uploading">
              Batal
            </button>
            <button type="submit" class="btn btn-primary" :disabled="!file || uploading">
              <span v-if="uploading" class="spinner-border spinner-border-sm me-2"></span>
              {{ uploading ? 'Uploading...' : 'Upload' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import studentDocumentService from '../../services/studentDocumentService'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'uploaded'])

const file = ref(null)
const fileInput = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = (event) => {
  const selectedFile = event.target.files[0]
  if (selectedFile) {
    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('Error: Ukuran file maksimal 10MB')
      fileInput.value.value = ''
      return
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Error: Format file tidak didukung')
      fileInput.value.value = ''
      return
    }

    file.value = selectedFile
  }
}

const removeFile = () => {
  file.value = null
  fileInput.value.value = ''
  uploadProgress.value = 0
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleSubmit = async () => {
  if (!file.value) {
    return
  }

  try {
    uploading.value = true
    uploadProgress.value = 0

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)

    await studentDocumentService.uploadFile(props.document.id, file.value)

    clearInterval(progressInterval)
    uploadProgress.value = 100

    setTimeout(() => {
      alert('File dokumen berhasil diupload')
      emit('uploaded')
    }, 500)
  } catch (error) {
    console.error('Error uploading file:', error)
    alert('Error: ' + (error.response?.data?.error || 'Gagal mengupload file'))
    uploadProgress.value = 0
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 20px;
}

.modal-dialog {
  width: 100%;
  max-width: 500px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-title i {
  color: #dc2626;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.document-info {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.document-info h6 {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  font-weight: 600;
  color: #64748b;
  min-width: 80px;
}

.info-row .value {
  color: #1e293b;
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #dc2626;
  background: #fef2f2;
}

.upload-area.has-file {
  border-style: solid;
  border-color: #10b981;
  background: #f0fdf4;
}

.file-input {
  display: none;
}

.upload-placeholder i {
  font-size: 48px;
  color: #94a3b8;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.file-icon {
  font-size: 40px;
  color: #10b981;
}

.file-info {
  flex: 1;
  text-align: left;
}

.file-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  word-break: break-all;
}

.file-size {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.upload-progress {
  margin-top: 16px;
}

.progress {
  height: 30px;
  border-radius: 8px;
  background: #f1f5f9;
}

.progress-bar {
  background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.btn-close:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .modal-dialog {
    max-width: 100%;
    margin: 0;
  }
}
</style>
