<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Surat Masuk</h4>
        <p class="text-muted mb-0">Kelola surat masuk dan disposisi</p>
      </div>
      <button class="btn btn-primary" @click="showCreateModal">
        <i class="bi bi-plus-lg me-2"></i>Tambah Surat Masuk
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
              <option value="BARU">Baru</option>
              <option value="DISPOSISI">Disposisi</option>
              <option value="PROSES">Proses</option>
              <option value="SELESAI">Selesai</option>
              <option value="ARSIP">Arsip</option>
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
              placeholder="Cari perihal, pengirim, nomor surat..."
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
          <p class="mt-3">Belum ada surat masuk</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th style="width: 50px">#</th>
                <th style="width: 130px">Nomor Surat</th>
                <th>Perihal</th>
                <th style="width: 150px">Pengirim</th>
                <th style="width: 100px">Tgl Diterima</th>
                <th style="width: 100px">Klasifikasi</th>
                <th style="width: 80px">Prioritas</th>
                <th style="width: 100px">Status</th>
                <th style="width: 180px" class="text-center">Aksi</th>
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
                <td>{{ letter.sender }}</td>
                <td>{{ formatDate(letter.received_date) }}</td>
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
                      v-if="letter.status === 'BARU'"
                      @click="showDispositionModal(letter)"
                      class="btn btn-outline-success"
                      title="Disposisi"
                    >
                      <i class="bi bi-send"></i>
                    </button>
                    <button
                      @click="showEditModal(letter)"
                      class="btn btn-outline-warning"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
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
            <h5 class="modal-title">{{ isEditMode ? 'Edit Surat Masuk' : 'Tambah Surat Masuk' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nomor Surat Eksternal</label>
                  <input type="text" v-model="form.letter_number" class="form-control">
                  <small class="text-muted">Nomor dari pengirim (opsional)</small>
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
                  <label class="form-label">Pengirim <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    v-model="form.sender" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.sender }"
                    required
                  >
                  <div v-if="errors.sender" class="invalid-feedback">{{ errors.sender }}</div>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Tanggal Surat</label>
                  <input type="date" v-model="form.letter_date" class="form-control">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Tanggal Diterima <span class="text-danger">*</span></label>
                  <input 
                    type="date" 
                    v-model="form.received_date" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.received_date }"
                    required
                  >
                  <div v-if="errors.received_date" class="invalid-feedback">{{ errors.received_date }}</div>
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
                  {{ isEditMode ? 'Update' : 'Simpan' }}
                </button>
              </div>
            </form>
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Modal } from "bootstrap";
import incomingLetterService from "../services/incomingLetterService";
import apiClient from "../../../shared/utils/apiClient";

const router = useRouter();

// State
const loading = ref(true);
const submitting = ref(false);
const letters = ref([]);
const users = ref([]);
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
  sender: "",
  received_date: new Date().toISOString().split('T')[0],
  letter_date: "",
  priority: "NORMAL",
  description: "",
});

const dispositionForm = ref({
  to_user_id: "",
  instruction: "",
  due_date: "",
});

const currentLetter = ref(null);
const errors = ref({});

// Modal refs
const formModalElement = ref(null);
const dispositionModalElement = ref(null);
let formModal = null;
let dispositionModal = null;

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

    const response = await incomingLetterService.getAll(params);
    letters.value = response.data;
    pagination.value = response.pagination;
  } catch (error) {
    console.error("Error fetching letters:", error);
    alert("Gagal memuat data surat masuk");
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
    sender: "",
    received_date: new Date().toISOString().split('T')[0],
    letter_date: "",
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
    sender: letter.sender,
    received_date: letter.received_date,
    letter_date: letter.letter_date || "",
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
      await incomingLetterService.update(id, data);
      alert("Surat masuk berhasil diupdate");
    } else {
      await incomingLetterService.create(form.value);
      alert("Surat masuk berhasil ditambahkan");
    }

    formModal.hide();
    fetchLetters();
  } catch (error) {
    console.error("Error saving letter:", error);
    if (error.response?.data?.error) {
      alert(error.response.data.error);
    } else {
      alert("Gagal menyimpan surat masuk");
    }
  } finally {
    submitting.value = false;
  }
};

const showDispositionModal = (letter) => {
  currentLetter.value = letter;
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
      currentLetter.value.id,
      dispositionForm.value
    );
    dispositionModal.hide();
    alert("Disposisi berhasil dikirim");
    fetchLetters();
  } catch (error) {
    console.error("Error creating disposition:", error);
    alert("Gagal mengirim disposisi");
  } finally {
    submitting.value = false;
  }
};

const deleteLetter = async (letter) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus surat "${letter.subject}"?`)) {
    return;
  }

  try {
    await incomingLetterService.delete(letter.id);
    alert("Surat masuk berhasil dihapus");
    fetchLetters();
  } catch (error) {
    console.error("Error deleting letter:", error);
    alert("Gagal menghapus surat masuk");
  }
};

const goToDetail = (id) => {
  router.push(`/admin/incoming-letters/${id}`);
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
    BARU: "bg-primary",
    DISPOSISI: "bg-warning text-dark",
    PROSES: "bg-info",
    SELESAI: "bg-success",
    ARSIP: "bg-secondary",
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
  dispositionModal = new Modal(dispositionModalElement.value);
  fetchLetters();
  fetchUsers();
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
