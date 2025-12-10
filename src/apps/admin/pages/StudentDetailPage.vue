<template>
  <div class="student-detail-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <button class="btn btn-sm btn-outline-secondary me-3" @click="$router.back()">
          <i class="bi bi-arrow-left"></i> Kembali
        </button>
        <h2 class="d-inline">Detail Siswa</h2>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="student" class="row">
      <!-- Student Info -->
      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-body text-center">
            <img 
              :src="student.photo || '/placeholder-avatar.png'" 
              class="rounded-circle mb-3" 
              style="width: 150px; height: 150px; object-fit: cover;"
              alt="Foto Siswa"
            >
            <h4>{{ student.name }}</h4>
            <p class="text-muted mb-1">{{ student.nis }}</p>
            <p class="text-muted">{{ student.class?.name || '-' }}</p>
            <div class="mt-3">
              <span class="badge bg-primary me-2">{{ student.grade?.name }}</span>
              <span v-if="student.department" class="badge bg-info">{{ student.department.name }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Data Pribadi</h5>
          </div>
          <div class="card-body">
            <table class="table table-sm table-borderless">
              <tr>
                <td class="text-muted" style="width: 40%">NIS</td>
                <td>{{ student.nis || '-' }}</td>
              </tr>
              <tr>
                <td class="text-muted">NISN</td>
                <td>{{ student.nisn || '-' }}</td>
              </tr>
              <tr>
                <td class="text-muted">Jenis Kelamin</td>
                <td>{{ student.gender === 'L' ? 'Laki-laki' : student.gender === 'P' ? 'Perempuan' : '-' }}</td>
              </tr>
              <tr>
                <td class="text-muted">Tanggal Lahir</td>
                <td>{{ formatDate(student.date_of_birth) }}</td>
              </tr>
              <tr>
                <td class="text-muted">Alamat</td>
                <td>{{ student.address || '-' }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <!-- Parents and Documents -->
      <div class="col-md-8">
        <!-- Nav Tabs -->
        <ul class="nav nav-tabs mb-3" role="tablist">
          <li class="nav-item" role="presentation">
            <button 
              class="nav-link active" 
              data-bs-toggle="tab" 
              data-bs-target="#parents-tab"
              type="button"
            >
              <i class="bi bi-people"></i> Data Orang Tua
            </button>
          </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Parents Tab -->
          <div class="tab-pane fade show active" id="parents-tab">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Data Orang Tua / Wali</h5>
                <button class="btn btn-sm btn-primary" @click="openParentModal()">
                  <i class="bi bi-plus-circle"></i> Tambah
                </button>
              </div>
              <div class="card-body">
                <div v-if="parents.length === 0" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                  <p class="mt-2">Belum ada data orang tua</p>
                </div>

                <div v-for="parent in parents" :key="parent.id" class="parent-item mb-4 p-3 border rounded">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 class="mb-1">
                        {{ parent.full_name }}
                        <span v-if="parent.is_guardian" class="badge bg-success ms-2">Wali Utama</span>
                      </h5>
                      <span class="badge bg-secondary">{{ parent.type }}</span>
                    </div>
                    <div>
                      <button class="btn btn-sm btn-outline-primary me-1" @click="openParentModal(parent)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="deleteParent(parent.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-6">
                      <small class="text-muted d-block">NIK</small>
                      <span>{{ parent.nik || '-' }}</span>
                    </div>
                    <div class="col-md-6">
                      <small class="text-muted d-block">Telepon</small>
                      <span>{{ parent.phone || '-' }}</span>
                    </div>
                    <div class="col-md-6 mt-2">
                      <small class="text-muted d-block">Email</small>
                      <span>{{ parent.email || '-' }}</span>
                    </div>
                    <div class="col-md-6 mt-2">
                      <small class="text-muted d-block">Pekerjaan</small>
                      <span>{{ parent.occupation || '-' }}</span>
                    </div>
                    <div class="col-md-6 mt-2">
                      <small class="text-muted d-block">Pendidikan</small>
                      <span>{{ parent.education || '-' }}</span>
                    </div>
                    <div class="col-md-12 mt-2">
                      <small class="text-muted d-block">Alamat</small>
                      <span>{{ parent.address || '-' }}</span>
                    </div>
                  </div>

                  <!-- Documents -->
                  <div class="border-top pt-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <strong>Dokumen</strong>
                      <button class="btn btn-sm btn-outline-secondary" @click="openDocumentModal(parent.id)">
                        <i class="bi bi-file-earmark-plus"></i> Upload Dokumen
                      </button>
                    </div>
                    <div v-if="parent.documents && parent.documents.length > 0" class="d-flex flex-wrap gap-2">
                      <div 
                        v-for="doc in parent.documents" 
                        :key="doc.id"
                        class="document-item border rounded p-2"
                        style="min-width: 150px;"
                      >
                        <div class="d-flex justify-content-between align-items-start">
                          <div class="flex-grow-1">
                            <small class="text-muted d-block">{{ doc.document_type }}</small>
                            <a :href="doc.document_url" target="_blank" class="small">
                              <i class="bi bi-file-earmark-text"></i> Lihat
                            </a>
                          </div>
                          <button 
                            class="btn btn-sm btn-link text-danger p-0" 
                            @click="deleteDocument(doc.id)"
                            title="Hapus"
                          >
                            <i class="bi bi-x-circle"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-muted small">
                      <i class="bi bi-info-circle"></i> Belum ada dokumen
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Parent Modal -->
    <div class="modal fade" id="parentModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingParent ? 'Edit' : 'Tambah' }} Data Orang Tua</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveParent">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tipe <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="parentForm.type" required>
                    <option value="">Pilih Tipe</option>
                    <option value="AYAH">Ayah</option>
                    <option value="IBU">Ibu</option>
                    <option value="WALI">Wali</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nama Lengkap <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model="parentForm.full_name" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">NIK</label>
                  <input type="text" class="form-control" v-model="parentForm.nik" maxlength="16">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Telepon</label>
                  <input type="text" class="form-control" v-model="parentForm.phone">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" v-model="parentForm.email">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Pekerjaan</label>
                  <input type="text" class="form-control" v-model="parentForm.occupation">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Pendidikan</label>
                  <select class="form-select" v-model="parentForm.education">
                    <option value="">Pilih Pendidikan</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="D3">D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <div class="form-check mt-4">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      v-model="parentForm.is_guardian" 
                      id="isGuardian"
                    >
                    <label class="form-check-label" for="isGuardian">
                      Wali / Penanggung Jawab Utama
                    </label>
                  </div>
                </div>
                <div class="col-md-12 mb-3">
                  <label class="form-label">Alamat</label>
                  <textarea class="form-control" v-model="parentForm.address" rows="3"></textarea>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary" @click="saveParent">
              <i class="bi bi-save"></i> Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Upload Modal -->
    <div class="modal fade" id="documentModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Upload Dokumen</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Tipe Dokumen <span class="text-danger">*</span></label>
              <select class="form-select" v-model="documentForm.document_type" required>
                <option value="">Pilih Tipe</option>
                <option value="KTP">KTP</option>
                <option value="KK">Kartu Keluarga</option>
                <option value="AKTA">Akta Kelahiran</option>
                <option value="SURAT_WALI">Surat Pernyataan Wali</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">File <span class="text-danger">*</span></label>
              <input 
                type="file" 
                class="form-control" 
                @change="handleDocumentFile"
                accept=".pdf,.jpg,.jpeg,.png"
                required
              >
              <small class="text-muted">Format: PDF, JPG, PNG (Max 5MB)</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary" @click="uploadDocument">
              <i class="bi bi-upload"></i> Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Modal } from 'bootstrap';
import studentService from '../services/studentService';
import parentProfileService from '../services/parentProfileService';

const route = useRoute();
const loading = ref(false);
const student = ref(null);
const parents = ref([]);
const editingParent = ref(null);
const uploadingParentId = ref(null);

const parentForm = ref({
  id: null,
  type: '',
  full_name: '',
  nik: '',
  phone: '',
  email: '',
  occupation: '',
  education: '',
  is_guardian: false,
  address: '',
});

const documentForm = ref({
  document_type: '',
  file: null,
});

let parentModal = null;
let documentModal = null;

onMounted(async () => {
  parentModal = new Modal(document.getElementById('parentModal'));
  documentModal = new Modal(document.getElementById('documentModal'));
  await loadStudent();
  await loadParents();
});

async function loadStudent() {
  loading.value = true;
  try {
    const response = await studentService.getById(route.params.id);
    student.value = response;
  } catch (error) {
    console.error('Error loading student:', error);
    alert('Gagal memuat data siswa');
  } finally {
    loading.value = false;
  }
}

async function loadParents() {
  try {
    const response = await parentProfileService.getByStudent(route.params.id);
    parents.value = response.data || [];
  } catch (error) {
    console.error('Error loading parents:', error);
    parents.value = [];
  }
}

function openParentModal(parent = null) {
  if (parent) {
    editingParent.value = parent;
    parentForm.value = {
      id: parent.id,
      type: parent.type,
      full_name: parent.full_name,
      nik: parent.nik,
      phone: parent.phone,
      email: parent.email,
      occupation: parent.occupation,
      education: parent.education,
      is_guardian: parent.is_guardian,
      address: parent.address,
    };
  } else {
    editingParent.value = null;
    parentForm.value = {
      id: null,
      type: '',
      full_name: '',
      nik: '',
      phone: '',
      email: '',
      occupation: '',
      education: '',
      is_guardian: false,
      address: '',
    };
  }
  parentModal.show();
}

async function saveParent() {
  try {
    await parentProfileService.saveParent(route.params.id, parentForm.value);
    alert(editingParent.value ? 'Data orang tua berhasil diperbarui' : 'Data orang tua berhasil ditambahkan');
    parentModal.hide();
    await loadParents();
  } catch (error) {
    console.error('Error saving parent:', error);
    alert('Gagal menyimpan data orang tua: ' + error.message);
  }
}

async function deleteParent(parentId) {
  if (!confirm('Apakah Anda yakin ingin menghapus data orang tua ini?')) return;
  
  try {
    await parentProfileService.deleteParent(parentId);
    alert('Data orang tua berhasil dihapus');
    await loadParents();
  } catch (error) {
    console.error('Error deleting parent:', error);
    alert('Gagal menghapus data orang tua: ' + error.message);
  }
}

function openDocumentModal(parentId) {
  uploadingParentId.value = parentId;
  documentForm.value = {
    document_type: '',
    file: null,
  };
  documentModal.show();
}

function handleDocumentFile(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      event.target.value = '';
      return;
    }
    documentForm.value.file = file;
  }
}

async function uploadDocument() {
  if (!documentForm.value.document_type || !documentForm.value.file) {
    alert('Tipe dokumen dan file wajib diisi');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('document_type', documentForm.value.document_type);
    formData.append('document', documentForm.value.file);

    await parentProfileService.uploadDocument(uploadingParentId.value, formData);
    alert('Dokumen berhasil diupload');
    documentModal.hide();
    await loadParents();
  } catch (error) {
    console.error('Error uploading document:', error);
    alert('Gagal mengupload dokumen: ' + error.message);
  }
}

async function deleteDocument(documentId) {
  if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return;

  try {
    await parentProfileService.deleteDocument(documentId);
    alert('Dokumen berhasil dihapus');
    await loadParents();
  } catch (error) {
    console.error('Error deleting document:', error);
    alert('Gagal menghapus dokumen: ' + error.message);
  }
}

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
</script>

<style scoped>
.parent-item {
  background: #f8f9fa;
}

.document-item {
  background: white;
}

.document-item:hover {
  background: #f8f9fa;
}
</style>
