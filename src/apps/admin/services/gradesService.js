import apiClient from '../../../shared/utils/apiClient'

/**
 * Grades Service
 * Handle all grades CRUD operations
 */
class GradesService {
  /**
   * Get all grades
   * @param {number} schoolId - School ID filter
   * @returns {Promise<Array>} List of grades
   */
  async getAll(schoolId = null) {
    const params = schoolId ? { school_id: schoolId } : {}
    const response = await apiClient.get('/api/grades', { params })
    return response.data
  }

  /**
   * Get grade by ID
   * @param {number} id - Grade ID
   * @returns {Promise<Object>} Grade data
   */
  async getById(id) {
    const response = await apiClient.get(`/api/grades/${id}`)
    return response.data
  }

  /**
   * Create new grade
   * @param {Object} data - Grade data
   * @returns {Promise<Object>} Created grade
   */
  async create(data) {
    const response = await apiClient.post('/api/grades', data)
    return response.data
  }

  /**
   * Update grade
   * @param {number} id - Grade ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated grade
   */
  async update(id, data) {
    const response = await apiClient.put(`/api/grades/${id}`, data)
    return response.data
  }

  /**
   * Delete grade
   * @param {number} id - Grade ID
   * @returns {Promise<Object>} Delete result
   */
  async delete(id) {
    const response = await apiClient.delete(`/api/grades/${id}`)
    return response.data
  }
}

export default new GradesService()
