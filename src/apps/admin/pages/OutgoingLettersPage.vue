<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Surat Keluar</h4>
        <p class="text-muted mb-0">Kelola surat keluar dan approval</p>
      </div>
      <button class="btn btn-primary" @click="showCreateModal">
        <i class="bi bi-plus-lg me-2"></i>Buat Surat Keluar
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-2">
            <label class="form-label">Status</label>
            <select v-model="filters.status" class="form-select" @change="fetchLetters">
              <option value="">Semua</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="SENT">Terkirim</option>
              <option value="ARCHIVED">Arsip</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Klasifikasi</label>
            <select v-model="filters.classification" class="form-select" @change="fetchLetters">
              <option value="">Semua</option>
              <option value="UMUM">Umum</option>
              <option value="UNDANGAN">Undangan</option>
              <option value="RAHASIA">Rahasia</option>
              <option value="PENTING">Penting</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Prioritas</label>
            <select v-model="filters.priority" class="form-select" @change="fetchLetters">
              <option value="">Semua</option>
              <option value="LOW">Rendah</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Tinggi</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label">Dari Tanggal</label>
            <input type="date" v-model="filters.date_from" class="form-control" @change="fetchLetters">
          </div>
          <div class="col-md-2">
            <label class="form-label">Sampai Tanggal</label>
            <input type="date" v-model="filters.date_to" class="form-control" @change="fetchLetters">
          </div>
          <div class="col-md-2">
            <label class="form-label">&nbsp;</label>
            <button class="btn btn-secondary w-100" @click="resetFilters">
              <i class="bi bi-arrow-clockwise me-2"></i>Reset
            </button>
          </div>
          <div class="col-md-12">
            <label class="form-label">Cari</label>
            <input 
              type="text" 
              v-model="filters.search" 
              class="form-control" 
              placeholder="Cari perihal, penerima, nomor surat..."
              @input="debouncedSearch"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Letters Table -->
    <div v-else class="card">
      <div class="card-body">
        <div v-if="letters.length === 0" class="text-center text-muted py-5">
          <i class="bi bi-inbox display-1"></i>
          <p class="mt-3">Belum ada surat keluar</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th style="width: 50px">#</th>
                <th style="width: 130px">Nomor Surat</th>
                <th>Perihal</th>
                <th style="width: 150px">Penerima</th>
                <th style="width: 100px">Tgl Surat</th>
                <th style="width: 100px">Klasifikasi</th>
                <th style="width: 80px">Prioritas</th>
                <th style="width: 100px">Status</th>
                <th style="width: 250px" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(letter, index) in letters" :key="letter.id">
                <td>{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
                <td>
                  <div class="small text-muted">{{ letter.auto_number }}</div>
                  <div v-if="letter.letter_number" class="small">{{ letter.letter_number }}</div>
                </td>
                <td>
                  <strong>{{ letter.subject }}</strong>
                  <div v-if="letter.description" class="small text-muted text-truncate" style="max-width: 300px">
                    {{ letter.description }}
                  </div>
                </td>
                <td>{{ letter.recipient }}</td>
                <td>{{ formatDate(letter.letter_date) }}</td>
                <td>
                  <span class="badge" :class="getClassificationBadge(letter.classification)">
                    {{ letter.classification || '-' }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="getPriorityBadge(letter.priority)">
                    {{ letter.priority }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="getStatusBadge(letter.status)">
                    {{ letter.status }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button
                      @click="goToDetail(letter.id)"
                      class="btn btn-outline-primary"
                      title="Detail"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      v-if="['DRAFT', 'REJECTED'].includes(letter.status)"
                      @click="submitForApproval(letter)"
                      class="btn btn-outline-success"
                      title="Kirim Approval"
                    >
                      <i class="bi bi-send-check"></i>
                    </button>
                    <button
                      v-if="letter.status === 'PENDING'"
                      @click="showApprovalModal(letter, 'APPROVE')"
                      class="btn btn-outline-success"
                      title="Approve"
                    >
                      <i class="bi bi-check-circle"></i>
                    </button>
                    <button
                      v-if="letter.status === 'PENDING'"
                      @click="showApprovalModal(letter, 'REJECT')"
                      class="btn btn-outline-danger"
                      title="Reject"
                    >
                      <i class="bi bi-x-circle"></i>
                    </button>
                    <button
                      v-if="letter.status === 'APPROVED'"
                      @click="sendLetter(letter)"
                      class="btn btn-outline-primary"
                      title="Kirim Surat"
                    >
                      <i class="bi bi-send"></i>
                    </button>
                    <button
                      v-if="letter.status === 'SENT'"
                      @click="archiveLetter(letter)"
                      class="btn btn-outline-secondary"
                      title="Arsipkan"
                    >
                      <i class="bi bi-archive"></i>
                    </button>
                    <button
                      v-if="['DRAFT', 'REJECTED'].includes(letter.status)"
                      @click="showEditModal(letter)"
                      class="btn btn-outline-warning"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      v-if="['DRAFT', 'REJECTED'].includes(letter.status)"
                      @click="deleteLetter(letter)"
                      class="btn btn-outline-danger"
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
        <div v-if="pagination.totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
          <div class="text-muted">
            Menampilkan {{ (pagination.page - 1) * pagination.limit + 1 }} - 
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 
            dari {{ pagination.total }} data
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(pagination.page - 1)">
                  <i class="bi bi-chevron-left"></i>
                </a>
              </li>
              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: page === pagination.page }"
              >
                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
                <a class="page-link" href="#" @click.prevent="changePage(pagination.page + 1)">
                  <i class="bi bi-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" ref="formModalElement" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditMode ? 'Edit Surat Keluar' : 'Buat Surat Keluar' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nomor Surat</label>
                  <input type="text" v-model="form.letter_number" class="form-control">
                  <small class="text-muted">Otomatis jika kosong</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Klasifikasi</label>
                  <select v-model="form.classification" class="form-select">
                    <option value="">Pilih Klasifikasi</option>
                    <option value="UMUM">Umum</option>
                    <option value="UNDANGAN">Undangan</option>
                    <option value="RAHASIA">Rahasia</option>
                    <option value="PENTING">Penting</option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Perihal <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    v-model="form.subject" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.subject }"
                    required
                  >
                  <div v-if="errors.subject" class="invalid-feedback">{{ errors.subject }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Penerima <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    v-model="form.recipient" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.recipient }"
                    required
                  >
                  <div v-if="errors.recipient" class="invalid-feedback">{{ errors.recipient }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tanggal Surat <span class="text-danger">*</span></label>
                  <input 
                    type="date" 
                    v-model="form.letter_date" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.letter_date }"
                    required
                  >
                  <div v-if="errors.letter_date" class="invalid-feedback">{{ errors.letter_date }}</div>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Prioritas</label>
                  <select v-model="form.priority" class="form-select">
                    <option value="LOW">Rendah</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Tinggi</option>
                  </select>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Keterangan</label>
                  <textarea v-model="form.description" class="form-control" rows="3"></textarea>
                </div>
              </div>
              <div class="modal-footer mt-3">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditMode ? 'Update' : 'Simpan Draft' }}
                </button>
              </div>
            </form>
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Modal } from "bootstrap";
import outgoingLetterService from "../services/outgoingLetterService";

const router = useRouter();

// State
const loading = ref(true);
const submitting = ref(false);
const letters = ref([]);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const filters = ref({
  status: "",
  classification: "",
  priority: "",
  date_from: "",
  date_to: "",
  search: "",
});

const isEditMode = ref(false);
const form = ref({
  id: null,
  letter_number: "",
  classification: "",
  subject: "",
  recipient: "",
  letter_date: new Date().toISOString().split('T')[0],
  priority: "NORMAL",
  description: "",
});

const approvalAction = ref("APPROVE");
const approvalForm = ref({
  notes: "",
});

const currentLetter = ref(null);
const errors = ref({});

// Modal refs
const formModalElement = ref(null);
const approvalModalElement = ref(null);
let formModal = null;
let approvalModal = null;

// Computed
const visiblePages = computed(() => {
  const pages = [];
  const total = pagination.value.totalPages;
  const current = pagination.value.page;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    }
  }

  return pages;
});

// Methods
const fetchLetters = async () => {
  try {
    loading.value = true;
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...filters.value,
    };

    Object.keys(params).forEach((key) => {
      if (params[key] === "" || params[key] === null) {
        delete params[key];
      }
    });

    const response = await outgoingLetterService.getAll(params);
    letters.value = response.data;
    pagination.value = response.pagination;
  } catch (error) {
    console.error("Error fetching letters:", error);
    alert("Gagal memuat data surat keluar");
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page;
    fetchLetters();
  }
};

let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchLetters();
  }, 500);
};

const resetFilters = () => {
  filters.value = {
    status: "",
    classification: "",
    priority: "",
    date_from: "",
    date_to: "",
    search: "",
  };
  pagination.value.page = 1;
  fetchLetters();
};

const showCreateModal = () => {
  isEditMode.value = false;
  form.value = {
    id: null,
    letter_number: "",
    classification: "",
    subject: "",
    recipient: "",
    letter_date: new Date().toISOString().split('T')[0],
    priority: "NORMAL",
    description: "",
  };
  errors.value = {};
  formModal.show();
};

const showEditModal = (letter) => {
  isEditMode.value = true;
  form.value = {
    id: letter.id,
    letter_number: letter.letter_number || "",
    classification: letter.classification || "",
    subject: letter.subject,
    recipient: letter.recipient,
    letter_date: letter.letter_date,
    priority: letter.priority,
    description: letter.description || "",
  };
  errors.value = {};
  formModal.show();
};

const handleSubmit = async () => {
  try {
    submitting.value = true;
    errors.value = {};

    if (isEditMode.value) {
      const { id, ...data } = form.value;
      await outgoingLetterService.update(id, data);
      alert("Surat keluar berhasil diupdate");
    } else {
      await outgoingLetterService.create(form.value);
      alert("Surat keluar berhasil dibuat (status: DRAFT)");
    }

    formModal.hide();
    fetchLetters();
  } catch (error) {
    console.error("Error saving letter:", error);
    if (error.response?.data?.error) {
      alert(error.response.data.error);
    } else {
      alert("Gagal menyimpan surat keluar");
    }
  } finally {
    submitting.value = false;
  }
};

const submitForApproval = async (letter) => {
  if (!confirm(`Kirim surat "${letter.subject}" untuk approval?`)) {
    return;
  }

  try {
    await outgoingLetterService.submitForApproval(letter.id);
    alert("Surat berhasil dikirim untuk approval");
    fetchLetters();
  } catch (error) {
    console.error("Error submitting for approval:", error);
    alert("Gagal mengirim untuk approval");
  }
};

const showApprovalModal = (letter, action) => {
  currentLetter.value = letter;
  approvalAction.value = action;
  approvalForm.value = {
    notes: "",
  };
  approvalModal.show();
};

const handleApproval = async () => {
  try {
    submitting.value = true;
    await outgoingLetterService.approveOrReject(currentLetter.value.id, {
      action: approvalAction.value,
      notes: approvalForm.value.notes,
    });
    approvalModal.hide();
    alert(
      approvalAction.value === "APPROVE"
        ? "Surat berhasil disetujui"
        : "Surat ditolak"
    );
    fetchLetters();
  } catch (error) {
    console.error("Error in approval:", error);
    alert("Gagal memproses approval");
  } finally {
    submitting.value = false;
  }
};

const sendLetter = async (letter) => {
  if (!confirm(`Kirim surat "${letter.subject}"?`)) {
    return;
  }

  try {
    await outgoingLetterService.send(letter.id);
    alert("Surat berhasil dikirim");
    fetchLetters();
  } catch (error) {
    console.error("Error sending letter:", error);
    alert("Gagal mengirim surat");
  }
};

const archiveLetter = async (letter) => {
  if (!confirm(`Arsipkan surat "${letter.subject}"?`)) {
    return;
  }

  try {
    await outgoingLetterService.archive(letter.id);
    alert("Surat berhasil diarsipkan");
    fetchLetters();
  } catch (error) {
    console.error("Error archiving letter:", error);
    alert("Gagal mengarsipkan surat");
  }
};

const deleteLetter = async (letter) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus surat "${letter.subject}"?`)) {
    return;
  }

  try {
    await outgoingLetterService.delete(letter.id);
    alert("Surat keluar berhasil dihapus");
    fetchLetters();
  } catch (error) {
    console.error("Error deleting letter:", error);
    alert("Gagal menghapus surat keluar");
  }
};

const goToDetail = (id) => {
  router.push(`/admin/outgoing-letters/${id}`);
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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Lifecycle
onMounted(() => {
  formModal = new Modal(formModalElement.value);
  approvalModal = new Modal(approvalModalElement.value);
  fetchLetters();
});
</script>

<style scoped>
.table {
  font-size: 14px;
}

.table thead th {
  background: #f8f9fa;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  padding: 4px 10px;
  font-weight: 500;
  font-size: 11px;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
