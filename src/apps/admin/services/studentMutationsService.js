import apiClient from '../../../shared/utils/apiClient'

/**
 * Student Mutations Service
 * Handle all student mutations CRUD operations
 */
class StudentMutationsService {
  /**
   * Get all student mutations with pagination and filters
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 10, max: 100)
   * @param {number} options.schoolId - School ID filter (optional)
   * @param {string} options.type - Mutation type filter (MASUK/KELUAR) (optional)
   * @returns {Promise<Object>} Paginated mutations data
   */
  async getAll(options = {}) {
    const { page = 1, limit = 10, schoolId = null, type = null } = options
    const params = { page, limit }
    if (schoolId) {
      params.school_id = schoolId
    }
    if (type) {
      params.type = type
    }
    const response = await apiClient.get('/api/student-mutations', { params })
    return response.data
  }

  /**
   * Get mutation by ID
   * @param {number} id - Mutation ID
   * @returns {Promise<Object>} Mutation data
   */
  async getById(id) {
    const response = await apiClient.get(`/api/student-mutations/${id}`)
    return response.data
  }

  /**
   * Create new student mutation
   * @param {Object} data - Mutation data
   * @returns {Promise<Object>} Created mutation
   */
  async create(data) {
    const response = await apiClient.post('/api/student-mutations', data)
    return response.data
  }

  /**
   * Update student mutation
   * @param {number} id - Mutation ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated mutation
   */
  async update(id, data) {
    const response = await apiClient.put(`/api/student-mutations/${id}`, data)
    return response.data
  }

  /**
   * Delete student mutation
   * @param {number} id - Mutation ID
   * @returns {Promise<Object>} Delete result
   */
  async delete(id) {
    const response = await apiClient.delete(`/api/student-mutations/${id}`)
    return response.data
  }
}

export default new StudentMutationsService()
