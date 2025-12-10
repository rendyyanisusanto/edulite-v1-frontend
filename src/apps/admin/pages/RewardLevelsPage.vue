<template>
  <div class="reward-levels-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h4 class="mb-1">Tingkat & Poin Reward</h4>
        <p class="text-muted mb-0">Kelola tingkat reward berdasarkan rentang poin</p>
      </div>
      <button class="btn btn-success" @click="showCreateModal">
        <i class="bi bi-plus-circle me-2"></i>Tambah Tingkat
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Data Cards -->
    <div v-else class="row g-4">
      <div v-if="rewardLevels.length === 0" class="col-12">
        <div class="card">
          <div class="card-body text-center py-5">
            <i class="bi bi-inbox fs-1 d-block mb-3 text-muted"></i>
            <p class="mb-0">Belum ada data tingkat reward</p>
            <button class="btn btn-success mt-3" @click="showCreateModal">
              <i class="bi bi-plus-circle me-2"></i>Tambah Tingkat Reward
            </button>
          </div>
        </div>
      </div>

      <div v-for="level in rewardLevels" :key="level.id" class="col-md-6 col-lg-4">
        <div class="card level-card" :class="getLevelCardClass(level.name)">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 class="mb-1">{{ level.name }}</h5>
              </div>
              <div class="dropdown">
                <button 
                  class="btn btn-sm btn-light" 
                  type="button" 
                  data-bs-toggle="dropdown"
                >
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="showEditModal(level)">
                      <i class="bi bi-pencil me-2"></i>Edit
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item text-danger" href="#" @click.prevent="confirmDelete(level)">
                      <i class="bi bi-trash me-2"></i>Hapus
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div class="point-range mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <div class="text-center flex-fill">
                  <div class="point-label">Min Poin</div>
                  <div class="point-value">{{ level.min_point }}</div>
                </div>
                <div class="px-3">
                  <i class="bi bi-arrow-right fs-4"></i>
                </div>
                <div class="text-center flex-fill">
                  <div class="point-label">Max Poin</div>
                  <div class="point-value">{{ level.max_point }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="card mt-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div class="text-muted">
            Menampilkan {{ rewardLevels.length }} dari {{ pagination.total }} data
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: !pagination.hasPrevPage }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                  Previous
                </a>
              </li>
              <li 
                v-for="page in displayedPages" 
                :key="page" 
                class="page-item" 
                :class="{ active: page === currentPage }"
              >
                <a class="page-link" href="#" @click.prevent="changePage(page)">
                  {{ page }}
                </a>
              </li>
              <li class="page-item" :class="{ disabled: !pagination.hasNextPage }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                  Next
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="levelModal" tabindex="-1" ref="levelModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditMode ? 'Edit' : 'Tambah' }} Tingkat Reward</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <div class="mb-3">
                <label class="form-label">Nama Tingkat <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="formData.name" 
                  placeholder="Contoh: Biasa, Baik, Sangat Baik"
                  required
                />
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Min Poin <span class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control" 
                    v-model.number="formData.min_point" 
                    placeholder="0"
                    required
                  />
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Max Poin <span class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control" 
                    v-model.number="formData.max_point" 
                    placeholder="100"
                    required
                  />
                </div>
              </div>

              <div class="modal-footer px-0 pb-0">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Batal
                </button>
                <button type="submit" class="btn btn-success" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditMode ? 'Update' : 'Simpan' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { Modal } from 'bootstrap';
import { useAuthStore } from '../../auth/store/authStore';
import rewardService from '../services/rewardService';

export default {
  name: 'RewardLevelsPage',
  setup() {
    const authStore = useAuthStore();
    const schoolId = computed(() => authStore.user?.school_id);

    const rewardLevels = ref([]);
    const loading = ref(false);
    const submitting = ref(false);
    const isEditMode = ref(false);
    const currentPage = ref(1);
    const pagination = ref({
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });

    const formData = ref({
      school_id: schoolId.value,
      name: '',
      min_point: 0,
      max_point: 0,
    });

    const levelModal = ref(null);
    let modalInstance = null;

    const displayedPages = computed(() => {
      const pages = [];
      const maxPagesToShow = 5;
      const totalPages = pagination.value.totalPages;
      let startPage = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    });

    const getLevelCardClass = (name) => {
      const lowercaseName = name.toLowerCase();
      if (lowercaseName.includes('emas') || lowercaseName.includes('gold')) return 'border-warning';
      if (lowercaseName.includes('perak') || lowercaseName.includes('silver')) return 'border-secondary';
      if (lowercaseName.includes('perunggu') || lowercaseName.includes('bronze')) return 'border-danger';
      return 'border-success';
    };

    const fetchRewardLevels = async () => {
      try {
        loading.value = true;
        const response = await rewardService.getAllLevels({
          school_id: schoolId.value,
          page: currentPage.value,
          limit: pagination.value.limit,
        });
        rewardLevels.value = response.data;
        pagination.value = response.pagination;
      } catch (error) {
        console.error('Error fetching reward levels:', error);
        alert('Gagal memuat data tingkat reward');
      } finally {
        loading.value = false;
      }
    };
    const showCreateModal = () => {
      isEditMode.value = false;
      formData.value = {
        school_id: schoolId.value,
        name: '',
        min_point: 0,
        max_point: 0,
      };
      modalInstance.show();
    };

    const showEditModal = (level) => {
      isEditMode.value = true;
      formData.value = {
        id: level.id,
        school_id: level.school_id,
        name: level.name,
        min_point: level.min_point,
        max_point: level.max_point,
      };
      modalInstance.show();
    };

    const submitForm = async () => {
      try {
        submitting.value = true;
        if (isEditMode.value) {
          await rewardService.updateLevel(formData.value.id, formData.value);
          alert('Tingkat reward berhasil diupdate');
        } else {
          await rewardService.createLevel(formData.value);
          alert('Tingkat reward berhasil ditambahkan');
        }
        modalInstance.hide();
        fetchRewardLevels();
      } catch (error) {
        console.error('Error saving reward level:', error);
        alert('Gagal menyimpan data tingkat reward');
      } finally {
        submitting.value = false;
      }
    };

    const confirmDelete = async (level) => {
      if (confirm(`Apakah Anda yakin ingin menghapus tingkat "${level.name}"?`)) {
        try {
          await rewardService.deleteLevel(level.id);
          alert('Tingkat reward berhasil dihapus');
          fetchRewardLevels();
        } catch (error) {
          console.error('Error deleting reward level:', error);
          alert('Gagal menghapus tingkat reward');
        }
      }
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.value.totalPages) {
        currentPage.value = page;
        fetchRewardLevels();
      }
    };

    onMounted(() => {
      modalInstance = new Modal(levelModal.value);
      fetchRewardLevels();
    });

    return {
      rewardLevels,
      loading,
      submitting,
      isEditMode,
      currentPage,
      pagination,
      formData,
      levelModal,
      displayedPages,
      getLevelCardClass,
      showCreateModal,
      showEditModal,
      submitForm,
      confirmDelete,
      changePage,
    };
  },
};
</script>

<style scoped>
.reward-levels-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.level-card {
  transition: all 0.3s ease;
  border-width: 2px;
}

.level-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.point-range {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.point-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
}

.point-value {
  font-size: 24px;
  font-weight: bold;
  color: #198754;
}

.description {
  border-top: 1px solid #dee2e6;
  padding-top: 12px;
}
</style>
