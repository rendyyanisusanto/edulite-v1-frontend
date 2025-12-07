import apiClient from '../../../shared/utils/apiClient'

/**
 * Teachers Service
 * Handle all teachers CRUD operations
 */
class TeachersService {
  /**
   * Get all teachers with pagination
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 10, max: 100)
   * @param {number} options.schoolId - School ID filter (optional)
   * @returns {Promise<Object>} Paginated teachers data
   */
  async getAll(options = {}) {
    const { page = 1, limit = 10, schoolId = null } = options
    const params = { page, limit }
    if (schoolId) {
      params.school_id = schoolId
    }
    const response = await apiClient.get('/api/teachers', { params })
    return response.data
  }

  /**
   * Get teacher by ID
   * @param {number} id - Teacher ID
   * @returns {Promise<Object>} Teacher data
   */
  async getById(id) {
    const response = await apiClient.get(`/api/teachers/${id}`)
    return response.data
  }

  /**
   * Create new teacher
   * @param {Object} data - Teacher data
   * @returns {Promise<Object>} Created teacher
   */
  async create(data) {
    const response = await apiClient.post('/api/teachers', data)
    return response.data
  }

  /**
   * Update teacher
   * @param {number} id - Teacher ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated teacher
   */
  async update(id, data) {
    const response = await apiClient.put(`/api/teachers/${id}`, data)
    return response.data
  }

  /**
   * Delete teacher
   * @param {number} id - Teacher ID
   * @returns {Promise<Object>} Delete result
   */
  async delete(id) {
    const response = await apiClient.delete(`/api/teachers/${id}`)
    return response.data
  }
}

export default new TeachersService()
