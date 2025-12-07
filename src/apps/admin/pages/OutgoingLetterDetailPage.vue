<template>
  <div class="container-fluid py-4">
    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/admin/dashboard">Dashboard</router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link to="/admin/outgoing-letters">Surat Keluar</router-link>
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
            v-if="['DRAFT', 'REJECTED'].includes(letter.status)"
            @click="submitForApproval" 
            class="btn btn-success"
          >
            <i class="bi bi-send-check me-2"></i>Kirim Approval
          </button>
          <button 
            v-if="letter.status === 'PENDING'"
            @click="showApprovalModal('APPROVE')" 
            class="btn btn-success"
          >
            <i class="bi bi-check-circle me-2"></i>Approve
          </button>
          <button 
            v-if="letter.status === 'PENDING'"
            @click="showApprovalModal('REJECT')" 
            class="btn btn-danger"
          >
            <i class="bi bi-x-circle me-2"></i>Reject
          </button>
          <button 
            v-if="letter.status === 'APPROVED'"
            @click="sendLetter" 
            class="btn btn-primary"
          >
            <i class="bi bi-send me-2"></i>Kirim Surat
          </button>
          <button 
            v-if="letter.status === 'SENT'"
            @click="archiveLetter" 
            class="btn btn-secondary"
          >
            <i class="bi bi-archive me-2"></i>Arsipkan
          </button>
          <router-link 
            to="/admin/outgoing-letters" 
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
                    <th>Nomor Surat</th>
                    <td>{{ letter.letter_number }}</td>
                  </tr>
                  <tr>
                    <th>Perihal</th>
                    <td><strong>{{ letter.subject }}</strong></td>
                  </tr>
                  <tr>
                    <th>Penerima</th>
                    <td>{{ letter.recipient }}</td>
                  </tr>
                  <tr>
                    <th>Tanggal Surat</th>
                    <td>{{ formatDate(letter.letter_date) }}</td>
                  </tr>
                  <tr v-if="letter.send_date">
                    <th>Tanggal Dikirim</th>
                    <td>{{ formatDate(letter.send_date) }}</td>
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

          <!-- Approval History -->
          <div v-if="letter.LetterApprovals && letter.LetterApprovals.length > 0" class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">Riwayat Persetujuan</h5>
            </div>
            <div class="card-body">
              <div class="timeline">
                <div 
                  v-for="approval in letter.LetterApprovals" 
                  :key="approval.id"
                  class="timeline-item"
                >
                  <div class="timeline-marker" :class="getApprovalMarkerClass(approval.action)">
                    <i class="bi" :class="getApprovalIcon(approval.action)"></i>
                  </div>
                  <div class="timeline-content">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 class="mb-1">
                          <strong>{{ approval.user?.name || 'Unknown' }}</strong>
                        </h6>
                        <small class="text-muted">{{ formatDateTime(approval.createdAt) }}</small>
                      </div>
                      <span class="badge" :class="getApprovalBadge(approval.action)">
                        {{ approval.action }}
                      </span>
                    </div>
                    <p v-if="approval.notes" class="mb-0">
                      <i class="bi bi-chat-left-text me-1"></i>
                      {{ approval.notes }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Workflow Status -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">Status Workflow</h5>
            </div>
            <div class="card-body">
              <div class="workflow-steps">
                <div 
                  class="workflow-step"
                  :class="{ 
                    active: getWorkflowStepStatus('DRAFT') === 'active',
                    completed: getWorkflowStepStatus('DRAFT') === 'completed'
                  }"
                >
                  <div class="workflow-step-icon">
                    <i class="bi bi-file-earmark-text"></i>
                  </div>
                  <div class="workflow-step-label">Draft</div>
                </div>
                <div class="workflow-connector" :class="{ active: ['PENDING', 'APPROVED', 'SENT', 'ARCHIVED'].includes(letter.status) }"></div>
                <div 
                  class="workflow-step"
                  :class="{ 
                    active: getWorkflowStepStatus('PENDING') === 'active',
                    completed: getWorkflowStepStatus('PENDING') === 'completed'
                  }"
                >
                  <div class="workflow-step-icon">
                    <i class="bi bi-clock-history"></i>
                  </div>
                  <div class="workflow-step-label">Pending</div>
                </div>
                <div class="workflow-connector" :class="{ active: ['APPROVED', 'SENT', 'ARCHIVED'].includes(letter.status) }"></div>
                <div 
                  class="workflow-step"
                  :class="{ 
                    active: getWorkflowStepStatus('APPROVED') === 'active',
                    completed: getWorkflowStepStatus('APPROVED') === 'completed'
                  }"
                >
                  <div class="workflow-step-icon">
                    <i class="bi bi-check-circle"></i>
                  </div>
                  <div class="workflow-step-label">Approved</div>
                </div>
                <div class="workflow-connector" :class="{ active: ['SENT', 'ARCHIVED'].includes(letter.status) }"></div>
                <div 
                  class="workflow-step"
                  :class="{ 
                    active: getWorkflowStepStatus('SENT') === 'active',
                    completed: getWorkflowStepStatus('SENT') === 'completed'
                  }"
                >
                  <div class="workflow-step-icon">
                    <i class="bi bi-send-check"></i>
                  </div>
                  <div class="workflow-step-label">Terkirim</div>
                </div>
                <div class="workflow-connector" :class="{ active: letter.status === 'ARCHIVED' }"></div>
                <div 
                  class="workflow-step"
                  :class="{ 
                    active: getWorkflowStepStatus('ARCHIVED') === 'active',
                    completed: getWorkflowStepStatus('ARCHIVED') === 'completed'
                  }"
                >
                  <div class="workflow-step-icon">
                    <i class="bi bi-archive"></i>
                  </div>
                  <div class="workflow-step-label">Arsip</div>
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
              <button 
                v-if="['DRAFT', 'REJECTED'].includes(letter.status)"
                class="btn btn-sm btn-primary" 
                @click="$refs.fileInput.click()"
              >
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
                      v-if="['DRAFT', 'REJECTED'].includes(letter.status)"
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

    <!-- Approval Modal -->
    <div class="modal fade" ref="approvalModalElement" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ approvalAction === 'APPROVE' ? 'Approve Surat' : 'Reject Surat' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleApproval">
              <div class="alert" :class="approvalAction === 'APPROVE' ? 'alert-success' : 'alert-danger'">
                <i class="bi" :class="approvalAction === 'APPROVE' ? 'bi-check-circle' : 'bi-x-circle'"></i>
                Anda akan {{ approvalAction === 'APPROVE' ? 'menyetujui' : 'menolak' }} surat ini.
              </div>
              <div class="mb-3">
                <label class="form-label">Catatan</label>
                <textarea 
                  v-model="approvalForm.notes" 
                  class="form-control" 
                  rows="4"
                  placeholder="Berikan catatan atau alasan..."
                ></textarea>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <button 
                  type="submit" 
                  class="btn"
                  :class="approvalAction === 'APPROVE' ? 'btn-success' : 'btn-danger'"
                  :disabled="submitting"
                >
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ approvalAction === 'APPROVE' ? 'Setujui' : 'Tolak' }}
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
import outgoingLetterService from "../services/outgoingLetterService";

const route = useRoute();
const router = useRouter();

// State
const loading = ref(true);
const submitting = ref(false);
const letter = ref({});

const approvalAction = ref("APPROVE");
const approvalForm = ref({
  notes: "",
});

// Modal refs
const approvalModalElement = ref(null);
const fileInput = ref(null);
let approvalModal = null;

// Methods
const fetchLetter = async () => {
  try {
    loading.value = true;
    letter.value = await outgoingLetterService.getById(route.params.id);
  } catch (error) {
    console.error("Error fetching letter:", error);
    alert("Gagal memuat detail surat");
    router.push("/admin/outgoing-letters");
  } finally {
    loading.value = false;
  }
};

const submitForApproval = async () => {
  if (!confirm("Kirim surat untuk approval?")) {
    return;
  }

  try {
    await outgoingLetterService.submitForApproval(letter.value.id);
    alert("Surat berhasil dikirim untuk approval");
    fetchLetter();
  } catch (error) {
    console.error("Error submitting for approval:", error);
    alert("Gagal mengirim untuk approval");
  }
};

const showApprovalModal = (action) => {
  approvalAction.value = action;
  approvalForm.value = {
    notes: "",
  };
  approvalModal.show();
};

const handleApproval = async () => {
  try {
    submitting.value = true;
    await outgoingLetterService.approveOrReject(letter.value.id, {
      action: approvalAction.value,
      notes: approvalForm.value.notes,
    });
    approvalModal.hide();
    alert(
      approvalAction.value === "APPROVE"
        ? "Surat berhasil disetujui"
        : "Surat ditolak"
    );
    fetchLetter();
  } catch (error) {
    console.error("Error in approval:", error);
    alert("Gagal memproses approval");
  } finally {
    submitting.value = false;
  }
};

const sendLetter = async () => {
  if (!confirm("Kirim surat ini?")) {
    return;
  }

  try {
    await outgoingLetterService.send(letter.value.id);
    alert("Surat berhasil dikirim");
    fetchLetter();
  } catch (error) {
    console.error("Error sending letter:", error);
    alert("Gagal mengirim surat");
  }
};

const archiveLetter = async () => {
  if (!confirm("Arsipkan surat ini?")) {
    return;
  }

  try {
    await outgoingLetterService.archive(letter.value.id);
    alert("Surat berhasil diarsipkan");
    fetchLetter();
  } catch (error) {
    console.error("Error archiving letter:", error);
    alert("Gagal mengarsipkan surat");
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("file", file);

    await outgoingLetterService.uploadAttachment(letter.value.id, formData);
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
    await outgoingLetterService.deleteAttachment(letter.value.id, attachmentId);
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

const getWorkflowStepStatus = (status) => {
  const statusOrder = ['DRAFT', 'PENDING', 'APPROVED', 'SENT', 'ARCHIVED'];
  const currentIndex = statusOrder.indexOf(letter.value.status);
  const stepIndex = statusOrder.indexOf(status);

  if (letter.value.status === 'REJECTED') {
    return status === 'DRAFT' ? 'active' : '';
  }

  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'active';
  return '';
};

const getStatusBadge = (status) => {
  const badges = {
    DRAFT: "bg-secondary",
    PENDING: "bg-warning text-dark",
    APPROVED: "bg-success",
    REJECTED: "bg-danger",
    SENT: "bg-primary",
    ARCHIVED: "bg-dark",
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

const getApprovalBadge = (action) => {
  const badges = {
    APPROVE: "bg-success",
    REJECT: "bg-danger",
    SEND: "bg-primary",
    CLOSE: "bg-secondary",
  };
  return badges[action] || "bg-secondary";
};

const getApprovalMarkerClass = (action) => {
  const classes = {
    APPROVE: "bg-success",
    REJECT: "bg-danger",
    SEND: "bg-primary",
    CLOSE: "bg-secondary",
  };
  return classes[action] || "bg-secondary";
};

const getApprovalIcon = (action) => {
  const icons = {
    APPROVE: "bi-check-circle-fill",
    REJECT: "bi-x-circle-fill",
    SEND: "bi-send-check-fill",
    CLOSE: "bi-archive-fill",
  };
  return icons[action] || "bi-circle";
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
  approvalModal = new Modal(approvalModalElement.value);
  fetchLetter();
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

/* Workflow Steps */
.workflow-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 10px;
}

.workflow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 auto;
}

.workflow-step-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 3px solid #dee2e6;
  transition: all 0.3s ease;
}

.workflow-step.active .workflow-step-icon {
  background: #0d6efd;
  color: white;
  border-color: #0d6efd;
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1);
}

.workflow-step.completed .workflow-step-icon {
  background: #198754;
  color: white;
  border-color: #198754;
}

.workflow-step-label {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
  text-align: center;
}

.workflow-step.active .workflow-step-label {
  color: #0d6efd;
  font-weight: 600;
}

.workflow-step.completed .workflow-step-label {
  color: #198754;
}

.workflow-connector {
  flex: 1;
  height: 3px;
  background: #dee2e6;
  margin: 0 10px 30px;
  transition: all 0.3s ease;
}

.workflow-connector.active {
  background: #198754;
}
</style>
