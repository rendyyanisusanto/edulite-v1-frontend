<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="mb-1">Buku Tamu</h4>
        <p class="text-muted mb-0">Kelola kunjungan tamu sekolah</p>
      </div>
      <button class="btn btn-primary" @click="showCheckinModal">
        <i class="bi bi-plus-lg me-2"></i>Check-in Tamu
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Status</label>
            <select v-model="filters.status" class="form-select" @change="fetchGuestbooks">
              <option value="">Semua Status</option>
              <option value="IN">Check-in</option>
              <option value="OUT">Check-out</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Jenis Tamu</label>
            <select v-model="filters.guest_type" class="form-select" @change="fetchGuestbooks">
              <option value="">Semua Jenis</option>
              <option value="ORTU">Orang Tua</option>
              <option value="ALUMNI">Alumni</option>
              <option value="VENDOR">Vendor</option>
              <option value="INSTANSI">Instansi</option>
              <option value="TAMU">Tamu</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Dari Tanggal</label>
            <input type="date" v-model="filters.date_from" class="form-control" @change="fetchGuestbooks">
          </div>
          <div class="col-md-3">
            <label class="form-label">Sampai Tanggal</label>
            <input type="date" v-model="filters.date_to" class="form-control" @change="fetchGuestbooks">
          </div>
          <div class="col-md-12">
            <label class="form-label">Cari Tamu</label>
            <input 
              type="text" 
              v-model="filters.search" 
              class="form-control" 
              placeholder="Cari nama tamu, telepon, atau bertemu dengan..."
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

    <!-- Guestbooks Table -->
    <div v-else class="card">
      <div class="card-body">
        <div v-if="guestbooks.length === 0" class="text-center text-muted py-5">
          <i class="bi bi-inbox display-1"></i>
          <p class="mt-3">Belum ada data buku tamu</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th style="width: 50px">#</th>
                <th>Nama Tamu</th>
                <th style="width: 120px">Jenis</th>
                <th>Telepon</th>
                <th>Bertemu</th>
                <th>Tujuan</th>
                <th style="width: 110px">Tanggal</th>
                <th style="width: 90px">Check-in</th>
                <th style="width: 90px">Check-out</th>
                <th style="width: 80px">Status</th>
                <th style="width: 150px" class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(guest, index) in guestbooks" :key="guest.id">
                <td>{{ (pagination.page - 1) * pagination.limit + index + 1 }}</td>
                <td>
                  <strong>{{ guest.guest_name }}</strong>
                  <div v-if="guest.address" class="text-muted small">{{ guest.address }}</div>
                </td>
                <td>
                  <span class="badge" :class="getGuestTypeBadge(guest.guest_type)">
                    {{ guest.guest_type }}
                  </span>
                </td>
                <td>{{ guest.phone || '-' }}</td>
                <td>{{ guest.related_person || '-' }}</td>
                <td>
                  <span class="text-truncate" style="max-width: 200px; display: inline-block;" :title="guest.purpose">
                    {{ guest.purpose || '-' }}
                  </span>
                </td>
                <td>{{ formatDate(guest.visit_date) }}</td>
                <td>{{ formatTime(guest.checkin_time) }}</td>
                <td>{{ guest.checkout_time ? formatTime(guest.checkout_time) : '-' }}</td>
                <td>
                  <span 
                    class="badge" 
                    :class="guest.status === 'IN' ? 'bg-success' : 'bg-secondary'"
                  >
                    {{ guest.status }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button
                      v-if="guest.status === 'IN'"
                      @click="showCheckoutModal(guest)"
                      class="btn btn-success"
                      title="Check-out"
                    >
                      <i class="bi bi-box-arrow-right"></i>
                    </button>
                    <button
                      @click="showEditModal(guest)"
                      class="btn btn-outline-primary"
                      title="Edit"
                      :disabled="guest.status === 'OUT'"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      @click="deleteGuestbook(guest)"
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

    <!-- Check-in Modal -->
    <div class="modal fade" ref="checkinModalElement" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Check-in Tamu Baru</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleCheckin">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nama Tamu <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    v-model="form.guest_name"
                    class="form-control"
                    :class="{ 'is-invalid': errors.guest_name }"
                    required
                  >
                  <div v-if="errors.guest_name" class="invalid-feedback">{{ errors.guest_name }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Jenis Tamu <span class="text-danger">*</span></label>
                  <select
                    v-model="form.guest_type"
                    class="form-select"
                    :class="{ 'is-invalid': errors.guest_type }"
                    required
                  >
                    <option value="">Pilih Jenis</option>
                    <option value="ORTU">Orang Tua</option>
                    <option value="ALUMNI">Alumni</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="INSTANSI">Instansi</option>
                    <option value="TAMU">Tamu</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                  <div v-if="errors.guest_type" class="invalid-feedback">{{ errors.guest_type }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Telepon</label>
                  <input type="text" v-model="form.phone" class="form-control">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tanggal Kunjungan <span class="text-danger">*</span></label>
                  <input
                    type="date"
                    v-model="form.visit_date"
                    class="form-control"
                    :class="{ 'is-invalid': errors.visit_date }"
                    required
                  >
                  <div v-if="errors.visit_date" class="invalid-feedback">{{ errors.visit_date }}</div>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Alamat</label>
                  <textarea v-model="form.address" class="form-control" rows="2"></textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Bertemu dengan</label>
                  <input type="text" v-model="form.related_person" class="form-control">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tujuan Kunjungan</label>
                  <input type="text" v-model="form.purpose" class="form-control">
                </div>
                <div class="col-md-12">
                  <label class="form-label">Catatan</label>
                  <textarea v-model="form.note" class="form-control" rows="2"></textarea>
                </div>
              </div>
              <div class="modal-footer mt-3">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal fade" ref="editModalElement" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Data Tamu</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleEdit">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nama Tamu <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    v-model="editForm.guest_name"
                    class="form-control"
                    required
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Jenis Tamu <span class="text-danger">*</span></label>
                  <select v-model="editForm.guest_type" class="form-select" required>
                    <option value="ORTU">Orang Tua</option>
                    <option value="ALUMNI">Alumni</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="INSTANSI">Instansi</option>
                    <option value="TAMU">Tamu</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Telepon</label>
                  <input type="text" v-model="editForm.phone" class="form-control">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tanggal Kunjungan <span class="text-danger">*</span></label>
                  <input type="date" v-model="editForm.visit_date" class="form-control" required>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Alamat</label>
                  <textarea v-model="editForm.address" class="form-control" rows="2"></textarea>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Bertemu dengan</label>
                  <input type="text" v-model="editForm.related_person" class="form-control">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tujuan Kunjungan</label>
                  <input type="text" v-model="editForm.purpose" class="form-control">
                </div>
                <div class="col-md-12">
                  <label class="form-label">Catatan</label>
                  <textarea v-model="editForm.note" class="form-control" rows="2"></textarea>
                </div>
              </div>
              <div class="modal-footer mt-3">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Check-out Modal -->
    <div class="modal fade" ref="checkoutModalElement" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Check-out Tamu</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Apakah Anda yakin ingin check-out tamu <strong>{{ checkoutGuest?.guest_name }}</strong>?</p>
            <div class="mb-3">
              <label class="form-label">Catatan (opsional)</label>
              <textarea v-model="checkoutNote" class="form-control" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button
              type="button"
              class="btn btn-success"
              @click="handleCheckout"
              :disabled="submitting"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              Check-out
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Modal } from "bootstrap";
import guestbookService from "../services/guestbookService";

// State
const loading = ref(true);
const submitting = ref(false);
const guestbooks = ref([]);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const filters = ref({
  status: "",
  guest_type: "",
  date_from: "",
  date_to: "",
  search: "",
});

const form = ref({
  guest_name: "",
  guest_type: "",
  phone: "",
  address: "",
  purpose: "",
  related_person: "",
  visit_date: new Date().toISOString().split('T')[0],
  note: "",
});

const editForm = ref({
  id: null,
  guest_name: "",
  guest_type: "",
  phone: "",
  address: "",
  purpose: "",
  related_person: "",
  visit_date: "",
  note: "",
});

const checkoutGuest = ref(null);
const checkoutNote = ref("");
const errors = ref({});

// Modal refs
const checkinModalElement = ref(null);
const editModalElement = ref(null);
const checkoutModalElement = ref(null);
let checkinModal = null;
let editModal = null;
let checkoutModal = null;

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
const fetchGuestbooks = async () => {
  try {
    loading.value = true;
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...filters.value,
    };

    // Remove empty filters
    Object.keys(params).forEach((key) => {
      if (params[key] === "" || params[key] === null) {
        delete params[key];
      }
    });

    const response = await guestbookService.getAll(params);
    guestbooks.value = response.data;
    pagination.value = response.pagination;
  } catch (error) {
    console.error("Error fetching guestbooks:", error);
    alert("Gagal memuat data buku tamu");
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page;
    fetchGuestbooks();
  }
};

// Debounce search
let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchGuestbooks();
  }, 500);
};

const showCheckinModal = () => {
  // Reset form
  form.value = {
    guest_name: "",
    guest_type: "",
    phone: "",
    address: "",
    purpose: "",
    related_person: "",
    visit_date: new Date().toISOString().split('T')[0],
    note: "",
  };
  errors.value = {};
  checkinModal.show();
};

const handleCheckin = async () => {
  try {
    submitting.value = true;
    errors.value = {};

    await guestbookService.create(form.value);
    checkinModal.hide();
    alert("Tamu berhasil check-in");
    fetchGuestbooks();
  } catch (error) {
    console.error("Error checking in guest:", error);
    if (error.response?.data?.error) {
      alert(error.response.data.error);
    } else {
      alert("Gagal check-in tamu");
    }
  } finally {
    submitting.value = false;
  }
};

const showEditModal = (guest) => {
  editForm.value = {
    id: guest.id,
    guest_name: guest.guest_name,
    guest_type: guest.guest_type,
    phone: guest.phone || "",
    address: guest.address || "",
    purpose: guest.purpose || "",
    related_person: guest.related_person || "",
    visit_date: guest.visit_date,
    note: guest.note || "",
  };
  editModal.show();
};

const handleEdit = async () => {
  try {
    submitting.value = true;
    const { id, ...data } = editForm.value;
    await guestbookService.update(id, data);
    editModal.hide();
    alert("Data tamu berhasil diupdate");
    fetchGuestbooks();
  } catch (error) {
    console.error("Error updating guest:", error);
    alert("Gagal update data tamu");
  } finally {
    submitting.value = false;
  }
};

const showCheckoutModal = (guest) => {
  checkoutGuest.value = guest;
  checkoutNote.value = guest.note || "";
  checkoutModal.show();
};

const handleCheckout = async () => {
  try {
    submitting.value = true;
    await guestbookService.checkout(checkoutGuest.value.id, {
      note: checkoutNote.value,
    });
    checkoutModal.hide();
    alert("Tamu berhasil check-out");
    fetchGuestbooks();
  } catch (error) {
    console.error("Error checking out guest:", error);
    alert("Gagal check-out tamu");
  } finally {
    submitting.value = false;
  }
};

const deleteGuestbook = async (guest) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus data tamu ${guest.guest_name}?`)) {
    return;
  }

  try {
    await guestbookService.delete(guest.id);
    alert("Data tamu berhasil dihapus");
    fetchGuestbooks();
  } catch (error) {
    console.error("Error deleting guest:", error);
    alert("Gagal menghapus data tamu");
  }
};

const getGuestTypeBadge = (type) => {
  const badges = {
    ORTU: "bg-primary",
    ALUMNI: "bg-success",
    VENDOR: "bg-warning text-dark",
    INSTANSI: "bg-info",
    TAMU: "bg-secondary",
    LAINNYA: "bg-dark",
  };
  return badges[type] || "bg-secondary";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (datetimeString) => {
  const date = new Date(datetimeString);
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Lifecycle
onMounted(() => {
  checkinModal = new Modal(checkinModalElement.value);
  editModal = new Modal(editModalElement.value);
  checkoutModal = new Modal(checkoutModalElement.value);
  fetchGuestbooks();
});

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout);
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
  padding: 6px 12px;
  font-weight: 500;
  font-size: 12px;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
