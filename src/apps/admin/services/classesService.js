import apiClient from '../../../shared/utils/apiClient'

/**
 * Classes Service
 * Handle all classes CRUD operations
 */
class ClassesService {
  /**
   * Get all classes with pagination
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 10, max: 100)
   * @param {number} options.schoolId - School ID filter (optional)
   * @returns {Promise<Object>} Paginated classes data
   */
  async getAll(options = {}) {
    const { page = 1, limit = 10, schoolId = null } = options
    const params = { page, limit }
    if (schoolId) {
      params.school_id = schoolId
    }
    const response = await apiClient.get('/api/classes', { params })
    return response.data
  }

  /**
   * Get class by ID
   * @param {number} id - Class ID
   * @returns {Promise<Object>} Class data
   */
  async getById(id) {
    const response = await apiClient.get(`/api/classes/${id}`)
    return response.data
  }

  /**
   * Create new class
   * @param {Object} data - Class data
   * @returns {Promise<Object>} Created class
   */
  async create(data) {
    const response = await apiClient.post('/api/classes', data)
    return response.data
  }

  /**
   * Update class
   * @param {number} id - Class ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated class
   */
  async update(id, data) {
    const response = await apiClient.put(`/api/classes/${id}`, data)
    return response.data
  }

  /**
   * Delete class
   * @param {number} id - Class ID
   * @returns {Promise<Object>} Delete result
   */
  async delete(id) {
    const response = await apiClient.delete(`/api/classes/${id}`)
    return response.data
  }
}

export default new ClassesService()
