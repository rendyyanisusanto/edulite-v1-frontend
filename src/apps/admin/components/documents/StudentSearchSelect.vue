<template>
  <div class="searchable-select" ref="containerRef">
    <div class="form-control select-input" @click="toggleDropdown">
      <div v-if="selectedStudent" class="selected-item">
        <span class="student-name">{{ selectedStudent.name }}</span>
        <span class="student-id">{{ selectedStudent.nisn || selectedStudent.nis }}</span>
        <button 
          type="button" 
          class="btn-clear" 
          @click.stop="clearSelection"
          v-if="!disabled"
        >
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div v-else class="placeholder">
        {{ placeholder }}
      </div>
      <i class="bi bi-chevron-down toggle-icon" :class="{ 'rotate': isOpen }"></i>
    </div>

    <div v-if="isOpen" class="dropdown-menu show">
      <div class="search-box">
        <i class="bi bi-search search-icon"></i>
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          class="form-control search-input"
          placeholder="Cari nama, NIS, atau NISN..."
          @input="handleSearch"
        />
      </div>

      <div class="dropdown-list">
        <div v-if="loading" class="loading-state">
          <div class="spinner-border spinner-border-sm" role="status"></div>
          <span>Mencari...</span>
        </div>

        <div v-else-if="students.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <span>{{ searchQuery ? 'Tidak ada hasil' : 'Mulai mengetik untuk mencari' }}</span>
        </div>

        <div
          v-else
          v-for="student in students"
          :key="student.id"
          class="dropdown-item"
          @click="selectStudent(student)"
        >
          <div class="student-info">
            <div class="student-name">{{ student.name }}</div>
            <div class="student-details">
              <span v-if="student.nisn">NISN: {{ student.nisn }}</span>
              <span v-if="student.nis">NIS: {{ student.nis }}</span>
              <span v-if="student.class">{{ student.class.name }}</span>
              <span v-if="student.grade">{{ student.grade.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import studentService from '../../services/studentService'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null
  },
  placeholder: {
    type: String,
    default: 'Pilih Siswa'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  preloadedStudent: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const containerRef = ref(null)
const searchInput = ref(null)
const isOpen = ref(false)
const searchQuery = ref('')
const students = ref([])
const selectedStudent = ref(null)
const loading = ref(false)

let searchTimeout = null

// Initialize with preloaded student if available
watch(() => props.preloadedStudent, (newStudent) => {
  if (newStudent) {
    selectedStudent.value = newStudent
  }
}, { immediate: true })

const toggleDropdown = () => {
  if (props.disabled) return
  
  isOpen.value = !isOpen.value
  
  if (isOpen.value) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
  students.value = []
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  
  if (!searchQuery.value.trim()) {
    students.value = []
    return
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      isLoading.value = true
      const response = await studentService.search(searchQuery.value, {
        limit: 20
      })
      students.value = response.data || []
    } catch (error) {
      console.error('Error searching students:', error)
      students.value = []
    } finally {
      loading.value = false
    }
  }, 300)
}

const selectStudent = (student) => {
  selectedStudent.value = student
  emit('update:modelValue', student.id)
  closeDropdown()
}

const clearSelection = () => {
  selectedStudent.value = null
  emit('update:modelValue', null)
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  clearTimeout(searchTimeout)
})
</script>

<style scoped>
.searchable-select {
  position: relative;
  width: 100%;
}

.select-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  min-height: 38px;
  padding-right: 32px;
  position: relative;
}

.select-input:hover {
  border-color: #86b7fe;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.student-name {
  font-weight: 500;
  color: #1e293b;
}

.student-id {
  font-size: 0.875rem;
  color: #64748b;
}

.btn-clear {
  background: none;
  border: none;
  padding: 2px 6px;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: #f1f5f9;
  color: #dc2626;
}

.placeholder {
  color: #94a3b8;
}

.toggle-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.2s;
  color: #64748b;
}

.toggle-icon.rotate {
  transform: translateY(-50%) rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.search-box {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  padding-left: 36px;
  font-size: 14px;
}

.dropdown-list {
  overflow-y: auto;
  max-height: 320px;
}

.loading-state,
.empty-state {
  padding: 24px;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-state i {
  font-size: 2rem;
  color: #cbd5e1;
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f1f5f9;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f8fafc;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-name {
  font-weight: 500;
  color: #1e293b;
  font-size: 14px;
}

.student-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}

.student-details span {
  display: flex;
  align-items: center;
}

.student-details span:not(:last-child)::after {
  content: '•';
  margin-left: 12px;
  color: #cbd5e1;
}
</style>
