<template>
  <div class="class-placements-page">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="mb-1">
            <i class="bi bi-diagram-2 me-2"></i>
            Penempatan Kelas
          </h2>
          <p class="text-muted mb-0">Kelola penempatan siswa ke kelas</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-danger" @click="openBulkAssignModal">
            <i class="bi bi-people-fill me-2"></i>
            Bulk Assignment
          </button>
          <button class="btn btn-danger" @click="openCreateModal">
            <i class="bi bi-plus-circle me-2"></i>
            Tambah Penempatan
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control" 
              placeholder="Cari nama siswa..."
            >
          </div>
          <div class="col-md-2">
            <select v-model="filterAcademicYear" class="form-select" @change="loadData">
              <option value="">Semua Tahun Ajaran</option>
              <option v-for="year in academicYears" :key="year.id" :value="year.id">
                {{ year.year_name }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filterGrade" class="form-select" @change="onGradeFilterChange">
              <option value="">Semua Tingkat</option>
              <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                {{ grade.name }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filterClass" class="form-select" @change="loadData">
              <option value="">Semua Kelas</option>
              <option v-for="cls in filteredClasses" :key="cls.id" :value="cls.id">
                {{ cls.name }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filterAssignmentType" class="form-select" @change="loadData">
              <option value="">Semua Tipe</option>
              <option value="AUTO">Auto</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>
          <div class="col-md-1">
            <button class="btn btn-outline-secondary w-100" @click="resetFilters">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-danger" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Data Table -->
    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Tahun Ajaran</th>
                <th>Tingkat</th>
                <th>Kelas</th>
                <th>Tipe</th>
                <th>Assigned By</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="displayData.length === 0">
                <td colspan="7" class="text-center text-muted py-4">
                  <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                  Tidak ada data penempatan kelas
                </td>
              </tr>
              <tr v-for="item in displayData" :key="item.id">
                <td>
                  <strong>{{ getStudentName(item.student_id) }}</strong>
                  <br>
                  <small class="text-muted">NIS: {{ getStudentNIS(item.student_id) }}</small>
                </td>
                <td>{{ getAcademicYearName(item.academic_year_id) }}</td>
                <td>
                  <span class="badge bg-primary">
                    {{ getGradeName(item.grade_id) }}
                  </span>
                </td>
                <td>
                  <span class="badge bg-info">
                    {{ getClassName(item.class_id) }}
                  </span>
                </td>
                <td>
                  <span 
                    class="badge" 
                    :class="item.assignment_type === 'AUTO' ? 'bg-secondary' : 'bg-success'"
                  >
                    {{ item.assignment_type }}
                  </span>
                </td>
                <td>
                  <small class="text-muted">
                    {{ getUserName(item.assigned_by) }}
                  </small>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button 
                      class="btn btn-outline-primary"
                      @click="openEditModal(item)"
                      title="Edit"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger"
                      @click="confirmDelete(item)"
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
        <div class="d-flex justify-content-between align-items-center mt-3">
          <div class="d-flex align-items-center gap-3">
            <div class="text-muted">
              Menampilkan {{ (currentPage - 1) * perPage + 1 }} - 
              {{ Math.min(currentPage * perPage, totalItems) }} dari 
              {{ totalItems }} data
            </div>
            <div class="d-flex align-items-center gap-2">
              <label class="text-muted mb-0" style="font-size: 0.9rem;">Per halaman:</label>
              <select 
                v-model.number="perPage" 
                class="form-select form-select-sm" 
                style="width: auto;"
                @change="changePerPage"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
          </div>
          <nav v-if="totalPages > 1">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: !hasPrevPage }">
                <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">Previous</a>
              </li>
              <li 
                v-for="page in totalPages" 
                :key="page"
                class="page-item" 
                :class="{ active: currentPage === page }"
              >
                <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: !hasNextPage }">
                <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Single Assignment Modal -->
    <div 
      class="modal fade" 
      :class="{ show: showModal }" 
      :style="{ display: showModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditMode ? 'Edit Penempatan' : 'Tambah Penempatan Kelas' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitForm">
              <!-- Student Selection with Search -->
              <div class="mb-3">
                <label class="form-label">Siswa <span class="text-danger">*</span></label>
                <div class="searchable-select" :class="{ 'is-invalid': errors.student_id }">
                  <input
                    v-model="studentSearch"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.student_id }"
                    placeholder="Cari nama atau NIS siswa..."
                    @focus="showStudentDropdown = true"
                    @blur="handleStudentBlur"
                    autocomplete="off"
                  >
                  <div 
                    v-if="showStudentDropdown && filteredStudents.length > 0" 
                    class="dropdown-menu show w-100"
                    style="max-height: 250px; overflow-y: auto;"
                  >
                    <button
                      v-for="student in filteredStudents"
                      :key="student.id"
                      type="button"
                      class="dropdown-item"
                      @mousedown.prevent="selectStudent(student)"
                    >
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{{ student.name }}</strong>
                          <br>
                          <small class="text-muted">NIS: {{ student.nis }}</small>
                        </div>
                      </div>
                    </button>
                  </div>
                  <div 
                    v-if="showStudentDropdown && filteredStudents.length === 0 && studentSearch" 
                    class="dropdown-menu show w-100"
                  >
                    <div class="dropdown-item text-muted">Siswa tidak ditemukan</div>
                  </div>
                </div>
                <div v-if="errors.student_id" class="invalid-feedback d-block">{{ errors.student_id }}</div>
                <div v-if="selectedStudent" class="mt-2">
                  <div class="alert alert-info py-2 px-3 mb-0">
                    <i class="bi bi-check-circle me-2"></i>
                    <strong>{{ selectedStudent.name }}</strong> - NIS: {{ selectedStudent.nis }}
                    <button 
                      type="button" 
                      class="btn-close btn-close-sm float-end" 
                      @click="clearStudent"
                      style="font-size: 0.7rem;"
                    ></button>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tahun Ajaran <span class="text-danger">*</span></label>
                  <select 
                    v-model.number="form.academic_year_id" 
                    class="form-select"
                    :class="{ 'is-invalid': errors.academic_year_id }"
                    required
                  >
                    <option value="">Pilih Tahun Ajaran</option>
                    <option v-for="year in academicYears" :key="year.id" :value="year.id">
                      {{ year.year_name }}
                    </option>
                  </select>
                  <div v-if="errors.academic_year_id" class="invalid-feedback">{{ errors.academic_year_id }}</div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Tingkat <span class="text-danger">*</span></label>
                  <select 
                    v-model.number="form.grade_id" 
                    class="form-select"
                    :class="{ 'is-invalid': errors.grade_id }"
                    @change="onGradeChange"
                    required
                  >
                    <option value="">Pilih Tingkat</option>
                    <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                      {{ grade.name }}
                    </option>
                  </select>
                  <div v-if="errors.grade_id" class="invalid-feedback">{{ errors.grade_id }}</div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Kelas <span class="text-danger">*</span></label>
                  <select 
                    v-model.number="form.class_id" 
                    class="form-select"
                    :class="{ 'is-invalid': errors.class_id }"
                    required
                  >
                    <option value="">Pilih Kelas</option>
                    <option v-for="cls in availableClasses" :key="cls.id" :value="cls.id">
                      {{ cls.name }}
                    </option>
                  </select>
                  <div v-if="errors.class_id" class="invalid-feedback">{{ errors.class_id }}</div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Tipe Assignment <span class="text-danger">*</span></label>
                  <select 
                    v-model="form.assignment_type" 
                    class="form-select"
                    :class="{ 'is-invalid': errors.assignment_type }"
                    required
                  >
                    <option value="">Pilih Tipe</option>
                    <option value="AUTO">Auto</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                  <div v-if="errors.assignment_type" class="invalid-feedback">{{ errors.assignment_type }}</div>
                </div>
              </div>

              <div v-if="formError" class="alert alert-danger">
                {{ formError }}
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Batal
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="submitForm"
              :disabled="submitting"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ isEditMode ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Assignment Modal -->
    <div 
      class="modal fade" 
      :class="{ show: showBulkModal }" 
      :style="{ display: showBulkModal ? 'block' : 'none' }"
      tabindex="-1"
    >
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-people-fill me-2"></i>
              Bulk Assignment - Penempatan Massal
            </h5>
            <button type="button" class="btn-close" @click="closeBulkModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitBulkAssign">
              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label">Tahun Ajaran <span class="text-danger">*</span></label>
                  <select 
                    v-model.number="bulkForm.academic_year_id" 
                    class="form-select"
                    required
                  >
                    <option value="">Pilih Tahun Ajaran</option>
                    <option v-for="year in academicYears" :key="year.id" :value="year.id">
                      {{ year.year_name }}
                    </option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Tingkat <span class="text-danger">*</span></label>
                  <select 
                    v-model.number="bulkForm.grade_id" 
                    class="form-select"
                    @change="onBulkGradeChange"
                    required
                  >
                    <option value="">Pilih Tingkat</option>
                    <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                      {{ grade.name }}
                    </option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label">Kelas Tujuan <span class="text-danger">*</span></label>
                  <select 
                    v-model.number="bulkForm.class_id" 
                    class="form-select"
                    required
                  >
                    <option value="">Pilih Kelas</option>
                    <option v-for="cls in bulkAvailableClasses" :key="cls.id" :value="cls.id">
                      {{ cls.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Student Selection -->
              <div class="mb-3">
                <label class="form-label">Pilih Siswa <span class="text-danger">*</span></label>
                <div class="border rounded p-3" style="max-height: 400px; overflow-y: auto;">
                  <div class="mb-2">
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-primary me-2"
                      @click="selectAllStudents"
                    >
                      <i class="bi bi-check-all me-1"></i> Pilih Semua
                    </button>
                    <button 
                      type="button" 
                      class="btn btn-sm btn-outline-secondary"
                      @click="clearAllStudents"
                    >
                      <i class="bi bi-x-circle me-1"></i> Bersihkan
                    </button>
                    <span class="ms-3 text-muted">
                      <i class="bi bi-info-circle me-1"></i>
                      Terpilih: <strong>{{ bulkForm.student_ids.length }}</strong> siswa
                    </span>
                  </div>
                  <div class="row g-2">
                    <div 
                      v-for="student in availableStudentsForBulk" 
                      :key="student.id"
                      class="col-md-6"
                    >
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          :value="student.id"
                          v-model="bulkForm.student_ids"
                          :id="'student-' + student.id"
                        >
                        <label class="form-check-label" :for="'student-' + student.id">
                          <strong>{{ student.name }}</strong> - {{ student.nis }}
                        </label>
                      </div>
                    </div>
                  </div>
                  <div v-if="availableStudentsForBulk.length === 0" class="text-center text-muted py-4">
                    Tidak ada siswa tersedia. Pilih tingkat terlebih dahulu.
                  </div>
                </div>
              </div>

              <div v-if="bulkFormError" class="alert alert-danger">
                {{ bulkFormError }}
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeBulkModal">
              Batal
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="submitBulkAssign"
              :disabled="bulkSubmitting || bulkForm.student_ids.length === 0"
            >
              <span v-if="bulkSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-people-fill me-2"></i>
              Assign {{ bulkForm.student_ids.length }} Siswa
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div 
      v-if="showModal || showBulkModal" 
      class="modal-backdrop fade show"
      @click="showModal ? closeModal() : closeBulkModal()"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import studentClassHistoryService from '../services/studentClassHistoryService'
import studentsService from '../../../shared/services/studentsService'
import classesService from '../services/classesService'
import gradesService from '../services/gradesService'
import academicYearsService from '../services/academicYearsService'
import { useAuthStore } from '../../auth/store/authStore'

const authStore = useAuthStore()

// Data
const placements = ref([])
const students = ref([])
const classes = ref([])
const grades = ref([])
const academicYears = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filterAcademicYear = ref('')
const filterGrade = ref('')
const filterClass = ref('')
const filterAssignmentType = ref('')

// Pagination from API
const currentPage = ref(1)
const perPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)
const hasNextPage = ref(false)
const hasPrevPage = ref(false)

// Single Assignment Modal
const showModal = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const formError = ref('')

// Searchable Select for Student
const studentSearch = ref('')
const showStudentDropdown = ref(false)
const selectedStudent = ref(null)

// Form
const form = ref({
  id: null,
  student_id: '',
  school_id: null,
  academic_year_id: '',
  grade_id: '',
  class_id: '',
  assigned_by: null,
  assignment_type: 'MANUAL'
})

const errors = ref({})

// Bulk Assignment Modal
const showBulkModal = ref(false)
const bulkSubmitting = ref(false)
const bulkFormError = ref('')

const bulkForm = ref({
  student_ids: [],
  school_id: null,
  academic_year_id: '',
  grade_id: '',
  class_id: '',
  assigned_by: null,
  assignment_type: 'MANUAL'
})

// Computed
const displayData = computed(() => {
  let data = placements.value

  // Client-side search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(item => {
      const studentName = getStudentName(item.student_id).toLowerCase()
      return studentName.includes(query)
    })
  }

  return data
})

const filteredStudents = computed(() => {
  if (!studentSearch.value) {
    return students.value.slice(0, 50)
  }
  
  const query = studentSearch.value.toLowerCase()
  return students.value.filter(student => 
    student.name.toLowerCase().includes(query) ||
    student.nis.toLowerCase().includes(query) ||
    student.nisn?.toLowerCase().includes(query)
  ).slice(0, 50)
})

const filteredClasses = computed(() => {
  if (!filterGrade.value) return classes.value
  return classes.value.filter(c => c.grade_id === parseInt(filterGrade.value))
})

const availableClasses = computed(() => {
  if (!form.value.grade_id) return []
  return classes.value.filter(c => c.grade_id === form.value.grade_id)
})

const bulkAvailableClasses = computed(() => {
  if (!bulkForm.value.grade_id) return []
  return classes.value.filter(c => c.grade_id === bulkForm.value.grade_id)
})

const availableStudentsForBulk = computed(() => {
  if (!bulkForm.value.grade_id) return []
  return students.value.filter(s => s.grade_id === bulkForm.value.grade_id)
})

// Methods
const getStudentName = (studentId) => {
  const student = students.value.find(s => s.id === studentId)
  return student ? student.name : 'Unknown'
}

const getStudentNIS = (studentId) => {
  const student = students.value.find(s => s.id === studentId)
  return student ? student.nis : '-'
}

const getAcademicYearName = (yearId) => {
  const year = academicYears.value.find(y => y.id === yearId)
  return year ? year.year_name : '-'
}

const getGradeName = (gradeId) => {
  const grade = grades.value.find(g => g.id === gradeId)
  return grade ? grade.name : '-'
}

const getClassName = (classId) => {
  const cls = classes.value.find(c => c.id === classId)
  return cls ? cls.name : '-'
}

const getUserName = (userId) => {
  return authStore.user?.id === userId ? authStore.user.name : 'Admin'
}

const selectStudent = (student) => {
  form.value.student_id = student.id
  selectedStudent.value = student
  studentSearch.value = student.name
  showStudentDropdown.value = false
}

const clearStudent = () => {
  form.value.student_id = ''
  selectedStudent.value = null
  studentSearch.value = ''
}

const handleStudentBlur = () => {
  setTimeout(() => {
    showStudentDropdown.value = false
  }, 200)
}

const loadData = async () => {
  loading.value = true
  try {
    const schoolId = authStore.user?.school_id || null
    
    const [placementsRes, studentsRes, classesRes, gradesRes, yearsRes] = await Promise.all([
      studentClassHistoryService.getAll({
        page: currentPage.value,
        limit: perPage.value,
        schoolId: schoolId,
        academicYearId: filterAcademicYear.value || null,
        gradeId: filterGrade.value || null,
        classId: filterClass.value || null
      }),
      studentsService.getAll(schoolId).catch(err => ({ data: [] })),
      classesService.getAll({ schoolId }).catch(err => ({ data: [] })),
      gradesService.getAll(schoolId).catch(err => ({ data: [] })),
      academicYearsService.getAll(schoolId).catch(err => ({ data: [] }))
    ])
    
    // Handle paginated response
    if (placementsRes.data && placementsRes.pagination) {
      placements.value = placementsRes.data
      totalItems.value = placementsRes.pagination.total
      totalPages.value = placementsRes.pagination.totalPages
      hasNextPage.value = placementsRes.pagination.hasNextPage
      hasPrevPage.value = placementsRes.pagination.hasPrevPage
    } else {
      placements.value = Array.isArray(placementsRes) ? placementsRes : (placementsRes.data || [])
      totalItems.value = placements.value.length
      totalPages.value = 1
    }
    
    students.value = Array.isArray(studentsRes) ? studentsRes : (studentsRes.data || [])
    classes.value = Array.isArray(classesRes) ? classesRes : (classesRes.data || [])
    grades.value = Array.isArray(gradesRes) ? gradesRes : (gradesRes.data || [])
    grades.value = grades.value.sort((a, b) => (a.level || 0) - (b.level || 0))
    academicYears.value = Array.isArray(yearsRes) ? yearsRes : (yearsRes.data || [])
  } catch (error) {
    console.error('Failed to load data:', error)
    alert('Gagal memuat data: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterAcademicYear.value = ''
  filterGrade.value = ''
  filterClass.value = ''
  filterAssignmentType.value = ''
  currentPage.value = 1
  loadData()
}

const onGradeFilterChange = () => {
  filterClass.value = ''
  loadData()
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadData()
}

const changePerPage = () => {
  currentPage.value = 1
  loadData()
}

const onGradeChange = () => {
  form.value.class_id = ''
}

const onBulkGradeChange = () => {
  bulkForm.value.class_id = ''
  bulkForm.value.student_ids = []
}

const openCreateModal = () => {
  isEditMode.value = false
  form.value = {
    id: null,
    student_id: '',
    school_id: authStore.user?.school_id,
    academic_year_id: '',
    grade_id: '',
    class_id: '',
    assigned_by: authStore.user?.id,
    assignment_type: 'MANUAL'
  }
  studentSearch.value = ''
  selectedStudent.value = null
  showStudentDropdown.value = false
  errors.value = {}
  formError.value = ''
  showModal.value = true
}

const openEditModal = (item) => {
  isEditMode.value = true
  form.value = {
    id: item.id,
    student_id: item.student_id,
    school_id: item.school_id,
    academic_year_id: item.academic_year_id,
    grade_id: item.grade_id,
    class_id: item.class_id,
    assigned_by: item.assigned_by,
    assignment_type: item.assignment_type
  }
  
  const student = students.value.find(s => s.id === item.student_id)
  if (student) {
    selectedStudent.value = student
    studentSearch.value = student.name
  }
  showStudentDropdown.value = false
  
  errors.value = {}
  formError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.student_id) {
    errors.value.student_id = 'Siswa wajib dipilih'
  }
  if (!form.value.academic_year_id) {
    errors.value.academic_year_id = 'Tahun ajaran wajib dipilih'
  }
  if (!form.value.grade_id) {
    errors.value.grade_id = 'Tingkat wajib dipilih'
  }
  if (!form.value.class_id) {
    errors.value.class_id = 'Kelas wajib dipilih'
  }
  if (!form.value.assignment_type) {
    errors.value.assignment_type = 'Tipe assignment wajib dipilih'
  }

  return Object.keys(errors.value).length === 0
}

const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true
  formError.value = ''

  const payload = {
    student_id: form.value.student_id,
    school_id: form.value.school_id,
    academic_year_id: form.value.academic_year_id,
    grade_id: form.value.grade_id,
    class_id: form.value.class_id,
    assigned_by: form.value.assigned_by,
    assignment_type: form.value.assignment_type
  }

  try {
    if (isEditMode.value) {
      await studentClassHistoryService.update(form.value.id, payload)
    } else {
      await studentClassHistoryService.create(payload)
    }

    await loadData()
    closeModal()
  } catch (error) {
    console.error('Failed to save placement:', error)
    formError.value = error.response?.data?.message || error.message || 'Gagal menyimpan data'
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (item) => {
  const studentName = getStudentName(item.student_id)
  if (!confirm(`Hapus penempatan kelas untuk "${studentName}"? Data tidak dapat dikembalikan.`)) {
    return
  }

  try {
    await studentClassHistoryService.delete(item.id)
    await loadData()
  } catch (error) {
    console.error('Failed to delete placement:', error)
    alert('Gagal menghapus: ' + (error.response?.data?.message || error.message))
  }
}

// Bulk Assignment Methods
const openBulkAssignModal = () => {
  bulkForm.value = {
    student_ids: [],
    school_id: authStore.user?.school_id,
    academic_year_id: '',
    grade_id: '',
    class_id: '',
    assigned_by: authStore.user?.id,
    assignment_type: 'MANUAL'
  }
  bulkFormError.value = ''
  showBulkModal.value = true
}

const closeBulkModal = () => {
  showBulkModal.value = false
}

const selectAllStudents = () => {
  bulkForm.value.student_ids = availableStudentsForBulk.value.map(s => s.id)
}

const clearAllStudents = () => {
  bulkForm.value.student_ids = []
}

const submitBulkAssign = async () => {
  if (bulkForm.value.student_ids.length === 0) {
    bulkFormError.value = 'Pilih minimal 1 siswa'
    return
  }

  if (!bulkForm.value.academic_year_id || !bulkForm.value.grade_id || !bulkForm.value.class_id) {
    bulkFormError.value = 'Lengkapi semua field yang wajib diisi'
    return
  }

  bulkSubmitting.value = true
  bulkFormError.value = ''

  try {
    await studentClassHistoryService.bulkAssign(bulkForm.value)
    await loadData()
    closeBulkModal()
    alert(`Berhasil menempatkan ${bulkForm.value.student_ids.length} siswa ke kelas`)
  } catch (error) {
    console.error('Failed to bulk assign:', error)
    bulkFormError.value = error.response?.data?.message || error.message || 'Gagal melakukan bulk assignment'
  } finally {
    bulkSubmitting.value = false
  }
}

// Watch filters
watch([searchQuery], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.class-placements-page {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header h2 {
  color: #dc2626;
  font-weight: 600;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  vertical-align: middle;
}

.btn-danger {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border: none;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  border-radius: 12px;
  border: none;
}

.modal-header {
  background-color: #dc2626;
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-header .btn-close {
  filter: brightness(0) invert(1);
}

.form-control:focus,
.form-select:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 0.25rem rgba(220, 38, 38, 0.25);
}

.pagination .page-link {
  color: #dc2626;
}

.pagination .page-item.active .page-link {
  background-color: #dc2626;
  border-color: #dc2626;
}

/* Searchable Select */
.searchable-select {
  position: relative;
}

.searchable-select .dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  margin-top: 2px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.searchable-select .dropdown-item {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.searchable-select .dropdown-item:last-child {
  border-bottom: none;
}

.searchable-select .dropdown-item:hover {
  background-color: #f8f9fa;
}

.searchable-select .dropdown-item:active {
  background-color: #e9ecef;
}

/* Bulk assignment checkboxes */
.form-check-input:checked {
  background-color: #dc2626;
  border-color: #dc2626;
}

.form-check-label {
  cursor: pointer;
  user-select: none;
}
</style>
