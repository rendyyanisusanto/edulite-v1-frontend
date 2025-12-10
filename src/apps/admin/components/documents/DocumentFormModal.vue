<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-file-earmark-text"></i>
            {{ isEdit ? 'Edit Dokumen' : 'Tambah Dokumen' }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label required">Siswa</label>
              <StudentSearchSelect
                v-model="form.student_id"
                :disabled="isEdit"
                :preloaded-student="preloadedStudent"
                placeholder="Ketik untuk mencari siswa..."
              />
              <div v-if="errors.student_id" class="invalid-feedback d-block">
                {{ errors.student_id }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label required">Jenis Dokumen</label>
              <select
                v-model="form.document_type_id"
                class="form-select"
                :class="{ 'is-invalid': errors.document_type_id }"
                @change="handleDocumentTypeChange"
              >
                <option value="">Pilih Jenis Dokumen</option>
                <option v-for="type in documentTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                  <span v-if="type.required">(Wajib)</span>
                </option>
              </select>
              <div v-if="errors.document_type_id" class="invalid-feedback">
                {{ errors.document_type_id }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Nama Dokumen (Manual)</label>
              <input
                v-model="form.document_type"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.document_type }"
                placeholder="Atau ketik manual jika tidak ada di pilihan"
              />
              <small class="text-muted">
                Kosongkan jika sudah memilih dari dropdown
              </small>
              <div v-if="errors.document_type" class="invalid-feedback">
                {{ errors.document_type }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Nomor Dokumen</label>
              <input
                v-model="form.document_number"
                type="text"
                class="form-control"
                placeholder="Nomor dokumen (jika ada)"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Tanggal Terbit</label>
              <input
                v-model="form.issued_date"
                type="date"
                class="form-control"
              />
            </div>

            <div class="mb-3">
              <label class="form-label">Catatan</label>
              <textarea
                v-model="form.notes"
                class="form-control"
                rows="3"
                placeholder="Catatan tambahan..."
              ></textarea>
            </div>

            <div v-if="!isEdit" class="mb-3">
              <label class="form-label">Upload File (Opsional)</label>
              <input
                ref="fileInput"
                type="file"
                class="form-control"
                @change="handleFileChange"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <small class="text-muted">
                Format: PDF, JPG, PNG, DOC, DOCX (Maks. 10MB)
              </small>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              Batal
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEdit ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import studentDocumentService from '../../services/studentDocumentService'
import StudentSearchSelect from './StudentSearchSelect.vue'

const props = defineProps({
  document: {
    type: Object,
    default: null
  },
  students: {
    type: Array,
    required: true
  },
  documentTypes: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'saved'])

const isEdit = computed(() => !!props.document)

const form = ref({
  student_id: '',
  document_type_id: '',
  document_type: '',
  document_number: '',
  issued_date: '',
  notes: ''
})

const file = ref(null)
const errors = ref({})
const saving = ref(false)
const fileInput = ref(null)
const preloadedStudent = ref(null)

// Initialize form with document data if editing
watch(() => props.document, (newDoc) => {
  if (newDoc) {
    form.value = {
      student_id: newDoc.student_id,
      document_type_id: newDoc.document_type_id || '',
      document_type: newDoc.document_type || '',
      document_number: newDoc.document_number || '',
      issued_date: newDoc.issued_date || '',
      notes: newDoc.notes || ''
    }
    // Set preloaded student for select component
    if (newDoc.student) {
      preloadedStudent.value = newDoc.student
    }
  } else {
    preloadedStudent.value = null
  }
}, { immediate: true })

const handleDocumentTypeChange = () => {
  const selectedType = props.documentTypes.find(t => t.id === parseInt(form.value.document_type_id))
  if (selectedType) {
    form.value.document_type = selectedType.name
  }
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
    file.value = selectedFile
  }
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.student_id) {
    errors.value.student_id = 'Siswa harus dipilih'
  }

  if (!form.value.document_type_id && !form.value.document_type) {
    errors.value.document_type = 'Jenis dokumen harus dipilih atau diisi'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    saving.value = true

    if (isEdit.value) {
      // Update existing document
      await studentDocumentService.update(props.document.id, form.value)
      alert('Dokumen berhasil diupdate')
    } else {
      // Create new document
      const response = await studentDocumentService.create(form.value)

      // Upload file if provided
      if (file.value && response.id) {
        await studentDocumentService.uploadFile(response.id, file.value)
      }

      alert('Dokumen berhasil ditambahkan')
    }

    emit('saved')
  } catch (error) {
    console.error('Error saving document:', error)
    alert('Error: ' + (error.response?.data?.error || 'Gagal menyimpan dokumen'))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (props.document) {
    form.value = {
      student_id: props.document.student_id,
      document_type_id: props.document.document_type_id || '',
      document_type: props.document.document_type || '',
      document_number: props.document.document_number || '',
      issued_date: props.document.issued_date || '',
      notes: props.document.notes || ''
    }
    if (props.document.student) {
      preloadedStudent.value = props.document.student
    }
  }
})
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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

.form-label.required::after {
  content: ' *';
  color: #dc2626;
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
