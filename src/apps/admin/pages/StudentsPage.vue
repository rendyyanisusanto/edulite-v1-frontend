<template>
  <div class="students-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Data Siswa</h2>
      <div class="d-flex gap-2">
        <button class="btn btn-success" @click="openImportModal">
          <i class="bi bi-file-earmark-excel me-2"></i>Import dari Excel
        </button>
        <button class="btn btn-danger" @click="openModal()">
          <i class="bi bi-plus-circle me-2"></i>Tambah Siswa
        </button>
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
              placeholder="Cari nama, NIS, NISN..."
              @input="handleSearch"
            >
          </div>
          <div class="col-md-2">
            <select v-model="filterAcademicYear" class="form-select" @change="loadData">
              <option value="">Semua Tahun Ajaran</option>
              <option v-for="year in academicYears" :key="year.id" :value="year.id">
                {{ year.name }}
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
            <select v-model="filterDepartment" class="form-select" @change="loadData">
              <option value="">Semua Jurusan</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div class="col-md-1">
            <button class="btn btn-secondary w-100" @click="resetFilters">
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

    <!-- Table -->
    <div v-else class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>No</th>
                <th>Foto</th>
                <th>NIS</th>
                <th>NISN</th>
                <th>Nama</th>
                <th>L/P</th>
                <th>Tahun Ajaran</th>
                <th>Tingkat</th>
                <th>Kelas</th>
                <th>Jurusan</th>
                <th>Dokumen</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredStudents.length === 0">
                <td colspan="12" class="text-center text-muted">Tidak ada data siswa</td>
              </tr>
              <tr v-for="(student, index) in paginatedStudents" :key="student.id">
                <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
                <td>
                  <div class="student-photo-thumb">
                    <img 
                      v-if="student.photo" 
                      :src="student.photo" 
                      :alt="student.name"
                    >
                    <i v-else class="bi bi-person-circle"></i>
                  </div>
                </td>
                <td>{{ student.nis }}</td>
                <td>{{ student.nisn }}</td>
                <td>{{ student.name }}</td>
                <td>{{ student.gender }}</td>
                <td>{{ getAcademicYearName(student.academic_year_id) }}</td>
                <td>{{ getGradeName(student.grade_id) }}</td>
                <td>{{ getClassName(student.class_id) }}</td>
                <td>{{ getDepartmentName(student.department_id) }}</td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-info" 
                    @click="goToDocuments(student)"
                    title="Kelola Dokumen"
                  >
                    <i class="bi bi-file-earmark-text"></i>
                    Dokumen
                  </button>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-success me-1" 
                    @click="$router.push(`/admin/students/${student.id}`)"
                    title="Detail & Orang Tua"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-primary me-1" 
                    @click="openModal(student)"
                    title="Edit"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger" 
                    @click="handleDelete(student)"
                    title="Hapus"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
          <div class="text-muted">
            Menampilkan {{ (currentPage - 1) * perPage + 1 }} - 
            {{ Math.min(currentPage * perPage, filteredStudents.length) }} 
            dari {{ filteredStudents.length }} data
          </div>
          <nav>
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage--">Previous</a>
              </li>
              <li 
                v-for="page in totalPages" 
                :key="page" 
                class="page-item" 
                :class="{ active: currentPage === page }"
              >
                <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <ImportStudentsModal ref="importModal" @imported="handleImported" />

    <!-- Modal Form -->
    <div 
      class="modal fade" 
      id="studentModal" 
      tabindex="-1" 
      ref="modalElement"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Edit Siswa' : 'Tambah Siswa' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row g-3">
                <!-- Photo Upload -->
                <div class="col-md-12">
                  <label class="form-label">Foto Siswa</label>
                  <div class="d-flex align-items-start gap-3">
                    <!-- Preview Photo -->
                    <div>
                      <div 
                        class="photo-preview" 
                        :class="{ 'has-photo': photoPreview || formData.photo }"
                      >
                        <img 
                          v-if="photoPreview || formData.photo" 
                          :src="photoPreview || formData.photo" 
                          alt="Preview"
                        >
                        <i v-else class="bi bi-person-circle"></i>
                      </div>
                    </div>
                    <!-- Upload Controls -->
                    <div class="flex-grow-1">
                      <input 
                        ref="photoInput"
                        type="file" 
                        class="form-control mb-2" 
                        accept="image/jpeg,image/jpg,image/png"
                        @change="handlePhotoSelect"
                        :class="{ 'is-invalid': errors.photo }"
                      >
                      <div v-if="errors.photo" class="invalid-feedback d-block">{{ errors.photo }}</div>
                      <small class="text-muted d-block">Format: JPG, PNG. Maksimal 2MB.</small>
                      <button 
                        v-if="photoPreview || formData.photo"
                        type="button" 
                        class="btn btn-sm btn-outline-danger mt-2"
                        @click="clearPhoto"
                      >
                        <i class="bi bi-x-circle me-1"></i>Hapus Foto
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Student Name -->
                <div class="col-md-12">
                  <label class="form-label">Nama Siswa <span class="text-danger">*</span></label>
                  <input 
                    v-model="formData.name" 
                    type="text" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.name }"
                    maxlength="100"
                  >
                  <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
                </div>

                <!-- NIS & NISN -->
                <div class="col-md-6">
                  <label class="form-label">NIS</label>
                  <input 
                    v-model="formData.nis" 
                    type="text" 
                    class="form-control" 
                    maxlength="50"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">NISN</label>
                  <input 
                    v-model="formData.nisn" 
                    type="text" 
                    class="form-control" 
                    maxlength="50"
                  >
                </div>

                <!-- Academic Year, Grade, Class -->
                <div class="col-md-4">
                  <label class="form-label">Tahun Ajaran <span class="text-danger">*</span></label>
                  <select 
                    v-model.number="formData.academic_year_id" 
                    class="form-select" 
                    :class="{ 'is-invalid': errors.academic_year_id }"
                  >
                    <option :value="null">Pilih Tahun Ajaran</option>
                    <option v-for="year in academicYears" :key="year.id" :value="year.id">
                      {{ year.name }}
                    </option>
                  </select>
                  <div v-if="errors.academic_year_id" class="invalid-feedback">{{ errors.academic_year_id }}</div>
                  <small v-if="academicYears.length === 0" class="text-warning">Data tahun ajaran belum ada</small>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Tingkat</label>
                  <select 
                    v-model.number="formData.grade_id" 
                    class="form-select" 
                    @change="onGradeChange"
                  >
                    <option value="">Pilih Tingkat</option>
                    <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                      {{ grade.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Kelas <span class="text-danger">*</span></label>
                  <select 
                    v-model.number="formData.class_id" 
                    class="form-select" 
                    :class="{ 'is-invalid': errors.class_id }"
                  >
                    <option value="">Pilih Kelas</option>
                    <option v-for="cls in availableClasses" :key="cls.id" :value="cls.id">
                      {{ cls.name }}
                    </option>
                  </select>
                  <div v-if="errors.class_id" class="invalid-feedback">{{ errors.class_id }}</div>
                </div>

                <!-- Department -->
                <div class="col-md-6">
                  <label class="form-label">Jurusan <span class="text-danger">*</span></label>
                  <select 
                    v-model.number="formData.department_id" 
                    class="form-select"
                    :class="{ 'is-invalid': errors.department_id }"
                  >
                    <option :value="null">Pilih Jurusan</option>
                    <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                      {{ dept.name }}
                    </option>
                  </select>
                  <div v-if="errors.department_id" class="invalid-feedback">{{ errors.department_id }}</div>
                </div>

                <!-- Gender & Date of Birth -->
                <div class="col-md-6">
                  <label class="form-label">Jenis Kelamin</label>
                  <select 
                    v-model="formData.gender" 
                    class="form-select"
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tanggal Lahir</label>
                  <input 
                    v-model="formData.date_of_birth" 
                    type="date" 
                    class="form-control"
                  >
                </div>

                <!-- Address -->
                <div class="col-md-12">
                  <label class="form-label">Alamat</label>
                  <textarea 
                    v-model="formData.address" 
                    class="form-control" 
                    rows="2"
                  ></textarea>
                </div>

                <!-- Parent Info -->
                <div class="col-md-6">
                  <label class="form-label">Nama Orang Tua</label>
                  <input 
                    v-model="formData.parent_name" 
                    type="text" 
                    class="form-control" 
                    maxlength="100"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Telepon Orang Tua</label>
                  <input 
                    v-model="formData.parent_phone" 
                    type="text" 
                    class="form-control" 
                    maxlength="30"
                  >
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="handleSubmit"
              :disabled="saving"
            >
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import studentsService from '../services/studentService'
import gradesService from '../services/gradesService'
import classesService from '../services/classesService'
import departmentsService from '../services/departmentsService'
import academicYearsService from '../services/academicYearsService'
import { useAuthStore } from '../../auth/store/authStore'
import ImportStudentsModal from '../components/students/ImportStudentsModal.vue'

const authStore = useAuthStore()
const router = useRouter()

// State
const students = ref([])
const grades = ref([])
const classes = ref([])
const departments = ref([])
const academicYears = ref([])
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const filterGrade = ref('')
const filterClass = ref('')
const filterDepartment = ref('')
const filterAcademicYear = ref('')
const currentPage = ref(1)
const perPage = ref(10)

// Modal
const modalElement = ref(null)
const photoInput = ref(null)
const importModal = ref(null)
let modalInstance = null
const isEdit = ref(false)
const formData = ref({
  name: '',
  academic_year_id: null,
  grade_id: null,
  class_id: null,
  department_id: null,
  nis: '',
  nisn: '',
  date_of_birth: '',
  gender: '',
  address: '',
  parent_name: '',
  parent_phone: '',
  photo: '',
  photo_key: ''
})
const errors = ref({})
const photoFile = ref(null)
const photoPreview = ref(null)

// Computed
const filteredStudents = computed(() => {
  let result = students.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(student => 
      student.nis?.toLowerCase().includes(query) ||
      student.nisn?.toLowerCase().includes(query) ||
      student.name?.toLowerCase().includes(query) ||
      student.parent_name?.toLowerCase().includes(query)
    )
  }

  // Academic year filter
  if (filterAcademicYear.value) {
    result = result.filter(s => s.academic_year_id === parseInt(filterAcademicYear.value))
  }

  // Grade filter
  if (filterGrade.value) {
    result = result.filter(s => s.grade_id === parseInt(filterGrade.value))
  }

  // Class filter
  if (filterClass.value) {
    result = result.filter(s => s.class_id === parseInt(filterClass.value))
  }

  // Department filter
  if (filterDepartment.value) {
    result = result.filter(s => s.department_id === parseInt(filterDepartment.value))
  }

  return result
})

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredStudents.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredStudents.value.length / perPage.value)
})

const filteredClasses = computed(() => {
  if (!filterGrade.value) return classes.value
  return classes.value.filter(c => c.grade_id === parseInt(filterGrade.value))
})

const availableClasses = computed(() => {
  if (!formData.value.grade_id) return []
  return classes.value.filter(c => c.grade_id === formData.value.grade_id)
})

// Methods
const loadData = async () => {
  loading.value = true
  try {
    const schoolId = authStore.user?.school_id || null
    
    const [studentsRes, gradesRes, classesRes, deptsRes, yearsRes] = await Promise.all([
      studentsService.getAll({ school_id: schoolId, limit: 1000 }).catch(err => {
        console.error('Students error:', err)
        return { data: [] }
      }),
      gradesService.getAll({ schoolId }).catch(err => {
        console.error('Grades error:', err)
        return { data: [] }
      }),
      classesService.getAll({ schoolId }).catch(err => {
        console.error('Classes error:', err)
        return { data: [] }
      }),
      departmentsService.getAll({ schoolId }).catch(err => {
        console.error('Departments error:', err)
        return { data: [] }
      }),
      academicYearsService.getAll({ schoolId }).catch(err => {
        console.error('Academic years error:', err)
        return { data: [] }
      })
    ])
    
    students.value = Array.isArray(studentsRes) ? studentsRes : (studentsRes.data || [])
    grades.value = Array.isArray(gradesRes) ? gradesRes : (gradesRes.data || [])
    grades.value = grades.value.sort((a, b) => (a.level || 0) - (b.level || 0))
    classes.value = Array.isArray(classesRes) ? classesRes : (classesRes.data || [])
    departments.value = Array.isArray(deptsRes) ? deptsRes : (deptsRes.data || [])
    academicYears.value = Array.isArray(yearsRes) ? yearsRes : (yearsRes.data || [])
    console.log('Academic Years loaded:', academicYears.value)
  } catch (error) {
    console.error('Failed to load data:', error)
    alert('Gagal memuat data: ' + (error.response?.data?.message || error.message))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  filterGrade.value = ''
  filterClass.value = ''
  filterDepartment.value = ''
  filterAcademicYear.value = ''
  currentPage.value = 1
  loadData()
}

const onGradeFilterChange = () => {
  filterClass.value = ''
  loadData()
}

const onGradeChange = () => {
  formData.value.class_id = null
}

const getGradeName = (gradeId) => {
  const grade = grades.value.find(g => g.id === gradeId)
  return grade ? grade.name : '-'
}

const getClassName = (classId) => {
  const cls = classes.value.find(c => c.id === classId)
  return cls ? cls.name : '-'
}

const getDepartmentName = (departmentId) => {
  if (!departmentId) return '-'
  const dept = departments.value.find(d => d.id === departmentId)
  return dept ? dept.name : '-'
}

const getAcademicYearName = (yearId) => {
  const year = academicYears.value.find(y => y.id === yearId)
  return year ? year.name : '-'
}

const handlePhotoSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!validTypes.includes(file.type)) {
    errors.value.photo = 'Format file harus JPG atau PNG'
    return
  }

  // Validate file size (2MB)
  if (file.size > 2 * 1024 * 1024) {
    errors.value.photo = 'Ukuran file maksimal 2MB'
    return
  }

  errors.value.photo = ''
  photoFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const clearPhoto = () => {
  photoFile.value = null
  photoPreview.value = null
  formData.value.photo = ''
  formData.value.photo_key = ''
  if (photoInput.value) {
    photoInput.value.value = ''
  }
  errors.value.photo = ''
}

const openModal = (student = null) => {
  isEdit.value = !!student
  errors.value = {}
  photoFile.value = null
  photoPreview.value = null
  
  if (student) {
    formData.value = {
      id: student.id,
      name: student.name,
      academic_year_id: student.academic_year_id,
      grade_id: student.grade_id,
      class_id: student.class_id,
      department_id: student.department_id,
      nis: student.nis,
      nisn: student.nisn,
      date_of_birth: student.date_of_birth,
      gender: student.gender,
      address: student.address,
      parent_name: student.parent_name,
      parent_phone: student.parent_phone,
      photo: student.photo || '',
      photo_key: student.photo_key || ''
    }
  } else {
    formData.value = {
      name: '',
      academic_year_id: null,
      grade_id: null,
      class_id: null,
      department_id: null,
      nis: '',
      nisn: '',
      date_of_birth: '',
      gender: '',
      address: '',
      parent_name: '',
      parent_phone: '',
      photo: '',
      photo_key: ''
    }
  }
  
  modalInstance.show()
}

const openImportModal = () => {
  if (importModal.value) {
    importModal.value.show()
  }
}

const handleImported = async () => {
  // Refresh data after import
  await loadData()
  if (importModal.value) {
    importModal.value.hide()
  }
}

const validateForm = () => {
  errors.value = {}
  
  // Hanya 4 kolom yang wajib diisi: nama, kelas, jurusan, tahun ajaran
  if (!formData.value.name?.trim()) errors.value.name = 'Nama siswa wajib diisi'
  if (!formData.value.class_id) errors.value.class_id = 'Kelas wajib diisi'
  if (!formData.value.department_id) errors.value.department_id = 'Jurusan wajib diisi'
  if (!formData.value.academic_year_id) errors.value.academic_year_id = 'Tahun ajaran wajib diisi'
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  saving.value = true
  try {
    const payload = {
      name: formData.value.name,
      academic_year_id: formData.value.academic_year_id,
      grade_id: formData.value.grade_id,
      class_id: formData.value.class_id,
      department_id: formData.value.department_id || null,
      nis: formData.value.nis,
      nisn: formData.value.nisn,
      date_of_birth: formData.value.date_of_birth,
      gender: formData.value.gender,
      address: formData.value.address,
      parent_name: formData.value.parent_name,
      parent_phone: formData.value.parent_phone,
      school_id: authStore.user?.school_id
    }
    
    let studentId
    
    if (isEdit.value) {
      // Update existing student
      await studentsService.update(formData.value.id, {
        ...payload,
        school_id: students.value.find(s => s.id === formData.value.id)?.school_id
      })
      studentId = formData.value.id
      
      // Upload photo if there's a new file
      if (photoFile.value) {
        const photoFormData = new FormData()
        photoFormData.append('photo', photoFile.value)
        
        await studentsService.uploadPhoto(studentId, photoFormData)
      }
      
      alert('Data siswa berhasil diperbarui')
    } else {
      // Create new student
      const createResponse = await studentsService.create(payload)
      studentId = createResponse.id || createResponse.data?.id
      
      // Upload photo if there's a file
      if (photoFile.value && studentId) {
        const photoFormData = new FormData()
        photoFormData.append('photo', photoFile.value)
        
        await studentsService.uploadPhoto(studentId, photoFormData)
      }
      
      alert('Data siswa berhasil ditambahkan')
    }
    
    modalInstance.hide()
    loadData()
  } catch (error) {
    console.error('Failed to save student:', error)
    alert('Gagal menyimpan data: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

const handleDelete = async (student) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus siswa ${student.name || student.nis}?`)) {
    return
  }
  
  try {
    await studentsService.delete(student.id)
    alert('Data siswa berhasil dihapus')
    loadData()
  } catch (error) {
    console.error('Failed to delete student:', error)
    alert('Gagal menghapus data: ' + (error.response?.data?.message || error.message))
  }
}

const goToDocuments = (student) => {
  router.push({
    path: '/admin/student-documents',
    query: { student_id: student.id }
  })
}

onMounted(() => {
  modalInstance = new Modal(modalElement.value)
  loadData()
})
</script>

<style scoped>
.students-page {
  padding: 20px;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  white-space: nowrap;
}

.pagination .page-item.active .page-link {
  background-color: #dc2626;
  border-color: #dc2626;
}

.pagination .page-link {
  color: #dc2626;
}

.pagination .page-link:hover {
  color: #b91c1c;
}

.photo-preview {
  width: 120px;
  height: 120px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f8f9fa;
}

.photo-preview.has-photo {
  border-style: solid;
  border-color: #dc2626;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-preview i {
  font-size: 3rem;
  color: #adb5bd;
}

.student-photo-thumb {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
}

.student-photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-photo-thumb i {
  font-size: 1.5rem;
  color: #adb5bd;
}
</style>
