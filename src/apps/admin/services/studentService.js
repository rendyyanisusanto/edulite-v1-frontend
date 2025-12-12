import apiClient from '../../../shared/utils/apiClient'

/**
 * Students Service
 * Handle all students CRUD operations
 */
class StudentsService {
  /**
   * Search students
   * @param {string} search - Search query
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Search results
   */
  async search(search = '', options = {}) {
    const params = { search, ...options }
    const response = await apiClient.get('/api/students/search', { params })
    return response.data
  }

  /**
   * Get all students with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated students data
   */
  async getAll(options = {}) {
    const response = await apiClient.get('/api/students', { params: options })
    return response.data
  }

  /**
   * Get student by ID
   * @param {number} id - Student ID
   * @returns {Promise<Object>} Student data
   */
  async getById(id) {
    const response = await apiClient.get(`/api/students/${id}`)
    return response.data
  }

  /**
   * Create new student
   * @param {Object} data - Student data
   * @returns {Promise<Object>} Created student
   */
  async create(data) {
    const response = await apiClient.post('/api/students', data)
    return response.data
  }

  /**
   * Update student
   * @param {number} id - Student ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated student
   */
  async update(id, data) {
    const response = await apiClient.put(`/api/students/${id}`, data)
    return response.data
  }

  /**
   * Delete student
   * @param {number} id - Student ID
   * @returns {Promise<Object>} Delete result
   */
  async delete(id) {
    const response = await apiClient.delete(`/api/students/${id}`)
    return response.data
  }

  /**
   * Upload photo
   * @param {number} id - Student ID
   * @param {File} file - Photo file
   * @returns {Promise<Object>} Upload result
   */
  async uploadPhoto(id, file) {
    const formData = new FormData()
    formData.append('photo', file)
    
    const response = await apiClient.post(
      `/api/students/${id}/upload-photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  }

  /**
   * Get classes for import
   * @returns {Promise<Object>} Classes data
   */
  async getClasses() {
    const response = await apiClient.get('/api/students/classes')
    return response.data
  }

  /**
   * Import students from Excel file
   * @param {File} file - Excel file
   * @param {number} classId - Class ID
   * @returns {Promise<Object>} Import result
   */
  async importFromExcel(file, classId) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('class_id', classId)

    const response = await apiClient.post(
      '/api/students/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  }

  /**
   * Download Excel template
   * @param {number} classId - Class ID
   * @returns {Promise<Blob>} Excel file blob
   */
  async downloadTemplate(classId) {
    const response = await apiClient.get(`/api/students/template/download?class_id=${classId}`, {
      responseType: 'blob'
    })
    return response.data
  }
}

export default new StudentsService()
