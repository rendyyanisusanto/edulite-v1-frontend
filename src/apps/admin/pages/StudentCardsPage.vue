<template>
  <div class="student-cards-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Kartu Siswa</h1>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary" @click="generateBulkCards">
          <i class="bi bi-lightning-charge"></i> Generate Massal
        </button>
        <button class="btn btn-primary" @click="printCards">
          <i class="bi bi-printer"></i> Cetak Kartu
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Tingkat</label>
            <select class="form-select" v-model="filters.grade_id" @change="loadStudents">
              <option value="">Semua Tingkat</option>
              <option v-for="grade in grades" :key="grade.id" :value="grade.id">{{ grade.name }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Kelas</label>
            <select class="form-select" v-model="filters.class_id" @change="loadStudents">
              <option value="">Semua Kelas</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Template</label>
            <select class="form-select" v-model="filters.template_id">
              <option value="">Semua Template</option>
              <option v-for="template in templates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Status Kartu</label>
            <select class="form-select" v-model="filters.card_status" @change="loadStudents">
              <option value="">Semua</option>
              <option value="generated">Sudah Generate</option>
              <option value="not_generated">Belum Generate</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Students Table -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" class="form-check-input" @change="toggleSelectAll" v-model="selectAll" />
                </th>
                <th>NIS</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th>No. Kartu</th>
                <th>QR Code</th>
                <th>Barcode</th>
                <th>Template</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in students" :key="student.id">
                <td>
                  <input type="checkbox" class="form-check-input" v-model="selectedStudents" :value="student.id" />
                </td>
                <td>{{ student.nis }}</td>
                <td>{{ student.name }}</td>
                <td>{{ student.class?.name || '-' }}</td>
                <td>
                  <span v-if="student.card_number" class="badge bg-success">{{ student.card_number }}</span>
                  <span v-else class="badge bg-secondary">-</span>
                </td>
                <td>
                  <i v-if="student.qr_code" class="bi bi-check-circle-fill text-success"></i>
                  <i v-else class="bi bi-x-circle-fill text-secondary"></i>
                </td>
                <td>
                  <i v-if="student.barcode" class="bi bi-check-circle-fill text-success"></i>
                  <i v-else class="bi bi-x-circle-fill text-secondary"></i>
                </td>
                <td>
                  <span v-if="student.cardTemplate" class="badge bg-info">{{ student.cardTemplate.name }}</span>
                  <span v-else class="badge bg-secondary">Default</span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" @click="generateCard(student.id)" :disabled="generatingCard === student.id">
                      <span v-if="generatingCard === student.id" class="spinner-border spinner-border-sm" role="status"></span>
                      <i v-else class="bi bi-lightning-charge"></i>
                    </button>
                    <button class="btn btn-outline-info" @click="previewCard(student)" :disabled="!student.card_number">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-secondary" @click="showAssignTemplate(student)">
                      <i class="bi bi-card-text"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center mt-3">
          <div>
            Menampilkan {{ students.length }} dari {{ pagination.total }} siswa
          </div>
          <nav v-if="pagination.totalPages > 1">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                <button class="page-link" @click="changePage(pagination.currentPage - 1)">Previous</button>
              </li>
              <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === pagination.currentPage }">
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
                <button class="page-link" @click="changePage(pagination.currentPage + 1)">Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Assign Template Modal -->
    <div class="modal fade" id="assignTemplateModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Pilih Template Kartu</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Template</label>
              <select class="form-select" v-model="selectedTemplateId">
                <option value="">Default Template</option>
                <option v-for="template in templates" :key="template.id" :value="template.id">
                  {{ template.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary" @click="assignTemplate">Simpan</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Preview Modal -->
    <div class="modal fade" id="cardPreviewModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Preview Kartu Siswa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="previewStudent" class="card-preview-wrapper">
              <StudentCardPreview :student="previewStudent" :template="previewTemplate" ref="cardPreviewRef" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
            <button type="button" class="btn btn-success" @click="downloadCardImage">
              <i class="bi bi-download"></i> Download Gambar
            </button>
            <button type="button" class="btn btn-primary" @click="downloadCardPDF">
              <i class="bi bi-file-pdf"></i> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import studentService from '../services/studentService';
import cardTemplateService from '../services/cardTemplateService';
import { Modal } from 'bootstrap';
import StudentCardPreview from '../components/cards/StudentCardPreview.vue';

const students = ref([]);
const templates = ref([]);
const grades = ref([]);
const classes = ref([]);
const loading = ref(false);
const generatingCard = ref(null);
const selectAll = ref(false);
const selectedStudents = ref([]);
const currentStudent = ref(null);
const selectedTemplateId = ref('');
const previewStudent = ref(null);
const previewTemplate = ref(null);
const cardPreviewRef = ref(null);

const filters = ref({
  grade_id: '',
  class_id: '',
  template_id: '',
  card_status: '',
});

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
  await Promise.all([
    loadTemplates(),
    loadGrades(),
    loadClasses(),
    loadStudents()
  ]);
});

async function loadStudents() {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.currentPage,
      limit: pagination.value.limit,
      school_id: localStorage.getItem('school_id'),
      ...filters.value
    };

    const response = await studentService.getAll(params);
    students.value = response.data;
    pagination.value = response.pagination;
  } catch (error) {
    alert('Gagal memuat data siswa: ' + error.message);
  } finally {
    loading.value = false;
  }
}

async function loadTemplates() {
  try {
    const response = await cardTemplateService.getAll();
    templates.value = response.data;
  } catch (error) {
    console.error('Error loading templates:', error);
  }
}

async function loadGrades() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/grades?school_id=${localStorage.getItem('school_id')}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    grades.value = data.data;
  } catch (error) {
    console.error('Error loading grades:', error);
  }
}

async function loadClasses() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/classes?school_id=${localStorage.getItem('school_id')}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    classes.value = data.data;
  } catch (error) {
    console.error('Error loading classes:', error);
  }
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedStudents.value = students.value.map(s => s.id);
  } else {
    selectedStudents.value = [];
  }
}

async function generateCard(studentId) {
  generatingCard.value = studentId;
  try {
    await cardTemplateService.generateAllCardData(studentId);
    alert('Data kartu berhasil dibuat');
    loadStudents();
  } catch (error) {
    alert('Gagal membuat data kartu: ' + error.message);
  } finally {
    generatingCard.value = null;
  }
}

async function generateBulkCards() {
  if (selectedStudents.value.length === 0) {
    alert('Pilih siswa terlebih dahulu');
    return;
  }

  if (!confirm(`Generate kartu untuk ${selectedStudents.value.length} siswa?`)) {
    return;
  }

  loading.value = true;
  let success = 0;
  let failed = 0;

  for (const studentId of selectedStudents.value) {
    try {
      await cardTemplateService.generateAllCardData(studentId);
      success++;
    } catch (error) {
      failed++;
      console.error(`Failed to generate card for student ${studentId}:`, error);
    }
  }

  alert(`Selesai!\nBerhasil: ${success}\nGagal: ${failed}`);
  selectedStudents.value = [];
  selectAll.value = false;
  loading.value = false;
  loadStudents();
}

function showAssignTemplate(student) {
  currentStudent.value = student;
  selectedTemplateId.value = student.card_template_id || '';
  const modal = new Modal(document.getElementById('assignTemplateModal'));
  modal.show();
}

async function assignTemplate() {
  try {
    await cardTemplateService.assignTemplate(currentStudent.value.id, selectedTemplateId.value);
    alert('Template berhasil diterapkan');
    Modal.getInstance(document.getElementById('assignTemplateModal')).hide();
    loadStudents();
  } catch (error) {
    alert('Gagal menerapkan template: ' + error.message);
  }
}

async function previewCard(student) {
  try {
    const response = await cardTemplateService.getStudentCard(student.id);
    previewStudent.value = response.data.student;
    previewTemplate.value = response.data.template;
    
    const modal = new Modal(document.getElementById('cardPreviewModal'));
    modal.show();
  } catch (error) {
    alert('Gagal memuat preview kartu: ' + error.message);
  }
}

async function downloadCardImage() {
  try {
    const cardElement = document.querySelector('.student-card');
    if (!cardElement) return;

    // Import html2canvas dynamically
    const html2canvas = (await import('html2canvas')).default;
    
    const canvas = await html2canvas(cardElement, {
      backgroundColor: '#ffffff',
      scale: 3, // Higher quality
      logging: false,
      useCORS: true, // Enable CORS for images
      allowTaint: true, // Allow cross-origin images
    });

    // Download as image
    const link = document.createElement('a');
    link.download = `kartu-${previewStudent.value.name.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    alert('Gagal mendownload gambar: ' + error.message);
  }
}

async function downloadCardPDF() {
  try {
    const cardElement = document.querySelector('.student-card');
    if (!cardElement) return;

    // Import libraries dynamically
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;
    
    const canvas = await html2canvas(cardElement, {
      backgroundColor: '#ffffff',
      scale: 3,
      logging: false,
      useCORS: true, // Enable CORS for images
      allowTaint: true, // Allow cross-origin images
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = previewTemplate.value.card_width || 300;
    const imgHeight = previewTemplate.value.card_height || 450;
    
    // Convert px to mm (assuming 96 DPI)
    const pdfWidth = imgWidth * 0.264583;
    const pdfHeight = imgHeight * 0.264583;
    
    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`kartu-${previewStudent.value.name.replace(/\s+/g, '-')}.pdf`);
  } catch (error) {
    alert('Gagal mendownload PDF: ' + error.message);
  }
}

function printCards() {
  if (selectedStudents.value.length === 0) {
    alert('Pilih siswa terlebih dahulu');
    return;
  }
  // TODO: Implement batch printing
  alert('Fitur cetak massal akan segera hadir');
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.currentPage = page;
    loadStudents();
  }
}
</script>

<style scoped>
.table-responsive {
  max-height: 600px;
  overflow-y: auto;
}

.card-preview-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 70vh;
  overflow: auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}
</style>
