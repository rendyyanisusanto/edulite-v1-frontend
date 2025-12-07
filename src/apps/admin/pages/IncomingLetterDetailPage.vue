<template>
  <div class="container-fluid py-4">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/admin/dashboard">Dashboard</router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link to="/admin/incoming-letters">Surat Masuk</router-link>
        </li>
        <li class="breadcrumb-item active">Detail</li>
      </ol>
    </nav>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 class="mb-2">{{ letter.subject }}</h4>
          <div class="d-flex gap-2 align-items-center">
            <span class="badge" :class="getStatusBadge(letter.status)">
              {{ letter.status }}
            </span>
            <span class="badge" :class="getClassificationBadge(letter.classification)">
              {{ letter.classification || 'UMUM' }}
            </span>
            <span class="badge" :class="getPriorityBadge(letter.priority)">
              {{ letter.priority }}
            </span>
          </div>
        </div>
        <div class="btn-group">
          <button 
            v-if="letter.status === 'BARU'"
            @click="showDispositionModal" 
            class="btn btn-success"
          >
            <i class="bi bi-send me-2"></i>Disposisi
          </button>
          <button 
            v-if="['BARU', 'DISPOSISI'].includes(letter.status)"
            @click="updateStatus('PROSES')" 
            class="btn btn-primary"
          >
            <i class="bi bi-play-circle me-2"></i>Proses
          </button>
          <button 
            v-if="letter.status === 'PROSES'"
            @click="updateStatus('SELESAI')" 
            class="btn btn-success"
          >
            <i class="bi bi-check-circle me-2"></i>Selesaikan
          </button>
          <button 
            v-if="letter.status === 'SELESAI'"
            @click="updateStatus('ARSIP')" 
            class="btn btn-secondary"
          >
            <i class="bi bi-archive me-2"></i>Arsipkan
          </button>
          <router-link 
            to="/admin/incoming-letters" 
            class="btn btn-outline-secondary"
          >
            <i class="bi bi-arrow-left me-2"></i>Kembali
          </router-link>
        </div>
      </div>

      <div class="row">
        <!-- Main Content -->
        <div class="col-lg-8">
          <!-- Letter Information -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">Informasi Surat</h5>
            </div>
            <div class="card-body">
              <table class="table table-borderless">
                <tbody>
                  <tr>
                    <th style="width: 200px">Nomor Otomatis</th>
                    <td>{{ letter.auto_number }}</td>
                  </tr>
                  <tr v-if="letter.letter_number">
                    <th>Nomor Surat Eksternal</th>
                    <td>{{ letter.letter_number }}</td>
                  </tr>
                  <tr>
                    <th>Perihal</th>
                    <td><strong>{{ letter.subject }}</strong></td>
                  </tr>
                  <tr>
                    <th>Pengirim</th>
                    <td>{{ letter.sender }}</td>
                  </tr>
                  <tr v-if="letter.letter_date">
                    <th>Tanggal Surat</th>
                    <td>{{ formatDate(letter.letter_date) }}</td>
                  </tr>
                  <tr>
                    <th>Tanggal Diterima</th>
                    <td>{{ formatDate(letter.received_date) }}</td>
                  </tr>
                  <tr>
                    <th>Klasifikasi</th>
                    <td>
                      <span class="badge" :class="getClassificationBadge(letter.classification)">
                        {{ letter.classification || 'UMUM' }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>Prioritas</th>
                    <td>
                      <span class="badge" :class="getPriorityBadge(letter.priority)">
                        {{ letter.priority }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>
                      <span class="badge" :class="getStatusBadge(letter.status)">
                        {{ letter.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="letter.description">
                    <th>Keterangan</th>
                    <td>{{ letter.description }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Dispositions -->
          <div v-if="letter.LetterDispositions && letter.LetterDispositions.length > 0" class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Riwayat Disposisi</h5>
            </div>
            <div class="card-body">
              <div class="timeline">
                <div 
                  v-for="(disposition, index) in letter.LetterDispositions" 
                  :key="disposition.id"
                  class="timeline-item"
                >
                  <div class="timeline-marker" :class="getDispositionMarkerClass(disposition.status)">
                    <i class="bi" :class="getDispositionIcon(disposition.status)"></i>
                  </div>
                  <div class="timeline-content">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 class="mb-1">
                          <strong>{{ disposition.from_user?.name || 'Unknown' }}</strong> 
                          → 
                          <strong>{{ disposition.to_user?.name || 'Unknown' }}</strong>
                        </h6>
                        <small class="text-muted">{{ formatDateTime(disposition.createdAt) }}</small>
                      </div>
                      <span class="badge" :class="getDispositionBadge(disposition.status)">
                        {{ disposition.status }}
                      </span>
                    </div>
                    <p class="mb-1">{{ disposition.instruction }}</p>
                    <div v-if="disposition.due_date" class="small text-muted">
                      <i class="bi bi-calendar-event me-1"></i>
                      Batas waktu: {{ formatDate(disposition.due_date) }}
                    </div>
                    <div v-if="disposition.notes" class="small text-primary mt-2">
                      <i class="bi bi-chat-left-text me-1"></i>
                      Catatan: {{ disposition.notes }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Approval History -->
          <div v-if="letter.LetterApprovals && letter.LetterApprovals.length > 0" class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">Riwayat Persetujuan</h5>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                <div 
                  v-for="approval in letter.LetterApprovals" 
                  :key="approval.id"
                  class="list-group-item"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="mb-1">{{ approval.user?.name || 'Unknown' }}</h6>
                      <small class="text-muted">{{ formatDateTime(approval.createdAt) }}</small>
                    </div>
                    <span class="badge" :class="getApprovalBadge(approval.action)">
                      {{ approval.action }}
                    </span>
                  </div>
                  <p v-if="approval.notes" class="mb-0 mt-2 small">
                    {{ approval.notes }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- Attachments -->
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Lampiran</h5>
              <button class="btn btn-sm btn-primary" @click="$refs.fileInput.click()">
                <i class="bi bi-plus-lg"></i>
              </button>
              <input 
                ref="fileInput" 
                type="file" 
                style="display: none"
                @change="handleFileUpload"
              >
            </div>
            <div class="card-body">
              <div v-if="!letter.LetterAttachments || letter.LetterAttachments.length === 0" class="text-muted text-center py-3">
                <i class="bi bi-paperclip display-6"></i>
                <p class="mb-0 mt-2">Belum ada lampiran</p>
              </div>
              <div v-else class="list-group list-group-flush">
                <div 
                  v-for="attachment in letter.LetterAttachments" 
                  :key="attachment.id"
                  class="list-group-item d-flex justify-content-between align-items-center px-0"
                >
                  <div class="d-flex align-items-center flex-grow-1">
                    <i class="bi bi-file-earmark me-2"></i>
                    <div class="small">
                      <div class="text-truncate" style="max-width: 200px">
                        {{ attachment.file_name }}
                      </div>
                      <div class="text-muted" style="font-size: 11px">
                        {{ formatFileSize(attachment.file_size) }}
                      </div>
                    </div>
                  </div>
                  <div class="btn-group btn-group-sm">
                    <a 
                      :href="getAttachmentUrl(attachment.file_path)" 
                      target="_blank"
                      class="btn btn-outline-primary"
                      title="Download"
                    >
                      <i class="bi bi-download"></i>
                    </a>
                    <button 
                      @click="deleteAttachment(attachment.id)"
                      class="btn btn-outline-danger"
                      title="Hapus"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Metadata</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <small class="text-muted d-block">Dibuat oleh</small>
                <strong>{{ letter.created_by_user?.name || '-' }}</strong>
                <div class="small text-muted">{{ formatDateTime(letter.createdAt) }}</div>
              </div>
              <div v-if="letter.updatedAt !== letter.createdAt">
                <small class="text-muted d-block">Diupdate oleh</small>
                <strong>{{ letter.updated_by_user?.name || '-' }}</strong>
                <div class="small text-muted">{{ formatDateTime(letter.updatedAt) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Disposition Modal -->
    <div class="modal fade" ref="dispositionModalElement" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Disposisi Surat</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleDisposition">
              <div class="mb-3">
                <label class="form-label">Disposisi Kepada <span class="text-danger">*</span></label>
                <select v-model="dispositionForm.to_user_id" class="form-select" required>
                  <option value="">Pilih User</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.name }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Instruksi <span class="text-danger">*</span></label>
                <textarea 
                  v-model="dispositionForm.instruction" 
                  class="form-control" 
                  rows="4"
                  required
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Batas Waktu</label>
                <input type="date" v-model="dispositionForm.due_date" class="form-control">
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-success" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  Kirim Disposisi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Modal } from "bootstrap";
import incomingLetterService from "../services/incomingLetterService";
import apiClient from "../../../shared/utils/apiClient";

const route = useRoute();
const router = useRouter();

// State
const loading = ref(true);
const submitting = ref(false);
const letter = ref({});
const users = ref([]);

const dispositionForm = ref({
  to_user_id: "",
  instruction: "",
  due_date: "",
});

// Modal refs
const dispositionModalElement = ref(null);
const fileInput = ref(null);
let dispositionModal = null;

// Methods
const fetchLetter = async () => {
  try {
    loading.value = true;
    letter.value = await incomingLetterService.getById(route.params.id);
  } catch (error) {
    console.error("Error fetching letter:", error);
    alert("Gagal memuat detail surat");
    router.push("/admin/incoming-letters");
  } finally {
    loading.value = false;
  }
};

const fetchUsers = async () => {
  try {
    const response = await apiClient.get('/api/users');
    users.value = response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const updateStatus = async (newStatus) => {
  if (!confirm(`Update status menjadi ${newStatus}?`)) {
    return;
  }

  try {
    await incomingLetterService.updateStatus(letter.value.id, newStatus);
    alert("Status berhasil diupdate");
    fetchLetter();
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Gagal mengupdate status");
  }
};

const showDispositionModal = () => {
  dispositionForm.value = {
    to_user_id: "",
    instruction: "",
    due_date: "",
  };
  dispositionModal.show();
};

const handleDisposition = async () => {
  try {
    submitting.value = true;
    await incomingLetterService.createDisposition(
      letter.value.id,
      dispositionForm.value
    );
    dispositionModal.hide();
    alert("Disposisi berhasil dikirim");
    fetchLetter();
  } catch (error) {
    console.error("Error creating disposition:", error);
    alert("Gagal mengirim disposisi");
  } finally {
    submitting.value = false;
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("file", file);

    await incomingLetterService.uploadAttachment(letter.value.id, formData);
    alert("Lampiran berhasil diupload");
    fetchLetter();
    fileInput.value.value = "";
  } catch (error) {
    console.error("Error uploading attachment:", error);
    alert("Gagal mengupload lampiran");
  }
};

const deleteAttachment = async (attachmentId) => {
  if (!confirm("Hapus lampiran ini?")) {
    return;
  }

  try {
    await incomingLetterService.deleteAttachment(letter.value.id, attachmentId);
    alert("Lampiran berhasil dihapus");
    fetchLetter();
  } catch (error) {
    console.error("Error deleting attachment:", error);
    alert("Gagal menghapus lampiran");
  }
};

const getAttachmentUrl = (path) => {
  return `${import.meta.env.VITE_API_URL}${path}`;
};

const getStatusBadge = (status) => {
  const badges = {
    BARU: "bg-primary",
    DISPOSISI: "bg-warning text-dark",
    PROSES: "bg-info",
    SELESAI: "bg-success",
    ARSIP: "bg-secondary",
  };
  return badges[status] || "bg-secondary";
};

const getClassificationBadge = (classification) => {
  const badges = {
    UMUM: "bg-secondary",
    UNDANGAN: "bg-primary",
    RAHASIA: "bg-danger",
    PENTING: "bg-warning text-dark",
  };
  return badges[classification] || "bg-secondary";
};

const getPriorityBadge = (priority) => {
  const badges = {
    LOW: "bg-info",
    NORMAL: "bg-secondary",
    HIGH: "bg-danger",
  };
  return badges[priority] || "bg-secondary";
};

const getDispositionBadge = (status) => {
  const badges = {
    PENDING: "bg-warning text-dark",
    ON_PROGRESS: "bg-info",
    DONE: "bg-success",
  };
  return badges[status] || "bg-secondary";
};

const getDispositionMarkerClass = (status) => {
  const classes = {
    PENDING: "bg-warning",
    ON_PROGRESS: "bg-info",
    DONE: "bg-success",
  };
  return classes[status] || "bg-secondary";
};

const getDispositionIcon = (status) => {
  const icons = {
    PENDING: "bi-clock-history",
    ON_PROGRESS: "bi-arrow-repeat",
    DONE: "bi-check-circle-fill",
  };
  return icons[status] || "bi-circle";
};

const getApprovalBadge = (action) => {
  const badges = {
    APPROVE: "bg-success",
    REJECT: "bg-danger",
    SEND: "bg-primary",
    CLOSE: "bg-secondary",
  };
  return badges[action] || "bg-secondary";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

// Lifecycle
onMounted(() => {
  dispositionModal = new Modal(dispositionModalElement.value);
  fetchLetter();
  fetchUsers();
});
</script>

<style scoped>
.timeline {
  position: relative;
  padding-left: 40px;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
}

.timeline-item {
  position: relative;
  padding-bottom: 30px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -32px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #dee2e6;
}

.timeline-content {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.table-borderless th {
  font-weight: 600;
  color: #6c757d;
}

.badge {
  padding: 5px 12px;
  font-weight: 500;
}
</style>
