<template>
  <div class="parent-identity-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Identitas Orang Tua / Wali</h2>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control" 
              placeholder="Cari nama orang tua, siswa, NIK..."
              @input="handleSearch"
            >
          </div>
          <div class="col-md-2">
            <select v-model="filterType" class="form-select" @change="loadData">
              <option value="">Semua Tipe</option>
              <option value="AYAH">Ayah</option>
              <option value="IBU">Ibu</option>
              <option value="WALI">Wali</option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filterGrade" class="form-select" @change="loadData">
              <option value="">Semua Tingkat</option>
              <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                {{ grade.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Nama Lengkap</th>
                <th>Tipe</th>
                <th>Nama Siswa</th>
                <th>Kelas</th>
                <th>NIK</th>
                <th>Telepon</th>
                <th>Pekerjaan</th>
                <th>Wali Utama</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="parents.length === 0">
                <td colspan="9" class="text-center text-muted py-4">
                  <i class="bi bi-inbox" style="font-size: 2rem;"></i>
                  <p class="mt-2">Tidak ada data</p>
                </td>
              </tr>
              <tr v-for="parent in parents" :key="parent.id">
                <td>
                  <strong>{{ parent.full_name }}</strong>
                  <br>
                  <small class="text-muted">{{ parent.email || '-' }}</small>
                </td>
                <td>
                  <span class="badge" :class="{
                    'bg-primary': parent.type === 'AYAH',
                    'bg-info': parent.type === 'IBU',
                    'bg-secondary': parent.type === 'WALI'
                  }">
                    {{ parent.type }}
                  </span>
                </td>
                <td>{{ parent.student?.name || '-' }}</td>
                <td>{{ parent.student?.class?.name || '-' }}</td>
                <td>{{ parent.nik || '-' }}</td>
                <td>{{ parent.phone || '-' }}</td>
                <td>{{ parent.occupation || '-' }}</td>
                <td>
                  <span v-if="parent.is_guardian" class="badge bg-success">Ya</span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary me-1"
                    @click="viewDetail(parent)"
                    title="Detail"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-info"
                    @click="$router.push(`/admin/students/${parent.student_id}`)"
                    title="Lihat Siswa"
                  >
                    <i class="bi bi-person"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
          <div class="text-muted">
            Menampilkan {{ (pagination.currentPage - 1) * pagination.limit + 1 }} - 
            {{ Math.min(pagination.currentPage * pagination.limit, pagination.total) }} 
            dari {{ pagination.total }} data
          </div>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                <button class="page-link" @click="changePage(pagination.currentPage - 1)">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li 
                v-for="page in visiblePages" 
                :key="page"
                class="page-item" 
                :class="{ active: page === pagination.currentPage }"
              >
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
                <button class="page-link" @click="changePage(pagination.currentPage + 1)">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div class="modal fade" id="detailModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detail Identitas Orang Tua</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedParent">
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Nama Lengkap</strong>
                <p>{{ selectedParent.full_name }}</p>
              </div>
              <div class="col-md-6">
                <strong>Tipe</strong>
                <p>
                  <span class="badge" :class="{
                    'bg-primary': selectedParent.type === 'AYAH',
                    'bg-info': selectedParent.type === 'IBU',
                    'bg-secondary': selectedParent.type === 'WALI'
                  }">
                    {{ selectedParent.type }}
                  </span>
                </p>
              </div>
              <div class="col-md-6">
                <strong>NIK</strong>
                <p>{{ selectedParent.nik || '-' }}</p>
              </div>
              <div class="col-md-6">
                <strong>Telepon</strong>
                <p>{{ selectedParent.phone || '-' }}</p>
              </div>
              <div class="col-md-6">
                <strong>Email</strong>
                <p>{{ selectedParent.email || '-' }}</p>
              </div>
              <div class="col-md-6">
                <strong>Pekerjaan</strong>
                <p>{{ selectedParent.occupation || '-' }}</p>
              </div>
              <div class="col-md-6">
                <strong>Pendidikan</strong>
                <p>{{ selectedParent.education || '-' }}</p>
              </div>
              <div class="col-md-6">
                <strong>Wali Utama</strong>
                <p>
                  <span v-if="selectedParent.is_guardian" class="badge bg-success">Ya</span>
                  <span v-else class="text-muted">Tidak</span>
                </p>
              </div>
              <div class="col-md-12">
                <strong>Alamat</strong>
                <p>{{ selectedParent.address || '-' }}</p>
              </div>
            </div>

            <hr>

            <div class="mb-3">
              <strong>Data Siswa</strong>
              <div class="mt-2 p-3 bg-light rounded">
                <p class="mb-1"><strong>Nama:</strong> {{ selectedParent.student?.name }}</p>
                <p class="mb-1"><strong>NIS:</strong> {{ selectedParent.student?.nis }}</p>
                <p class="mb-0"><strong>Kelas:</strong> {{ selectedParent.student?.class?.name }}</p>
              </div>
            </div>

            <div v-if="selectedParent.documents && selectedParent.documents.length > 0">
              <strong>Dokumen</strong>
              <div class="mt-2">
                <div 
                  v-for="doc in selectedParent.documents" 
                  :key="doc.id"
                  class="border rounded p-2 mb-2"
                >
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{{ doc.document_type }}</strong>
                    </div>
                    <a :href="doc.document_url" target="_blank" class="btn btn-sm btn-outline-primary">
                      <i class="bi bi-download"></i> Download
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
            <button 
              type="button" 
              class="btn btn-primary"
              @click="goToStudent"
            >
              <i class="bi bi-person"></i> Lihat Data Siswa
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Modal } from 'bootstrap';
import gradesService from '../services/gradesService';
import parentProfileService from '../services/parentProfileService';

const router = useRouter();
const loading = ref(false);
const parents = ref([]);
const grades = ref([]);
const searchQuery = ref('');
const filterType = ref('');
const filterGrade = ref('');
const selectedParent = ref(null);

let detailModal = null;
let searchTimeout = null;

const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  total: 0,
  limit: 20,
});

const visiblePages = computed(() => {
  const pages = [];
  const total = pagination.value.totalPages;
  const current = pagination.value.currentPage;
  
  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

onMounted(async () => {
  detailModal = new Modal(document.getElementById('detailModal'));
  await loadGrades();
  await loadData();
});

async function loadGrades() {
  try {
    const response = await gradesService.getAll();
    grades.value = response.data;
  } catch (error) {
    console.error('Error loading grades:', error);
  }
}

async function loadData() {
  loading.value = true;
  try {
    const response = await parentProfileService.getAll({
      page: pagination.value.currentPage,
      limit: pagination.value.limit,
      search: searchQuery.value,
      type: filterType.value,
      grade_id: filterGrade.value,
    });
    
    parents.value = response.data.data;
    pagination.value.total = response.data.pagination.total;
    pagination.value.totalPages = response.data.pagination.totalPages;
  } catch (error) {
    console.error('Error loading parent data:', error);
    alert('Gagal memuat data orang tua');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.currentPage = 1;
    loadData();
  }, 500);
}

function viewDetail(parent) {
  selectedParent.value = parent;
  detailModal.show();
}

function goToStudent() {
  if (selectedParent.value) {
    detailModal.hide();
    router.push(`/admin/students/${selectedParent.value.student_id}`);
  }
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.currentPage = page;
    loadData();
  }
}
</script>

<style scoped>
.table-responsive {
  max-height: 600px;
  overflow-y: auto;
}

.badge {
  font-size: 0.75rem;
}
</style>
