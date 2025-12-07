import apiClient from '../../../shared/utils/apiClient'

/**
 * Academic Years Service
 * Handle all academic years CRUD operations
 */
class AcademicYearsService {
  /**
   * Get all academic years
   * @param {number} schoolId - School ID filter
   * @returns {Promise<Array>} List of academic years
   */
  async getAll(schoolId = null) {
    const params = schoolId ? { school_id: schoolId } : {}
    const response = await apiClient.get('/api/academic-years', { params })
    return response.data
  }

  /**
   * Get academic year by ID
   * @param {number} id - Academic year ID
   * @returns {Promise<Object>} Academic year data
   */
  async getById(id) {
    const response = await apiClient.get(`/api/academic-years/${id}`)
    return response.data
  }

  /**
   * Create new academic year
   * @param {Object} data - Academic year data
   * @returns {Promise<Object>} Created academic year
   */
  async create(data) {
    const response = await apiClient.post('/api/academic-years', data)
    return response.data
  }

  /**
   * Update academic year
   * @param {number} id - Academic year ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated academic year
   */
  async update(id, data) {
    const response = await apiClient.put(`/api/academic-years/${id}`, data)
    return response.data
  }

  /**
   * Delete academic year
   * @param {number} id - Academic year ID
   * @returns {Promise<Object>} Delete result
   */
  async delete(id) {
    const response = await apiClient.delete(`/api/academic-years/${id}`)
    return response.data
  }

  /**
   * Set academic year as active
   * @param {number} id - Academic year ID
   * @returns {Promise<Object>} Update result
   */
  async setActive(id) {
    const response = await apiClient.patch(`/api/academic-years/${id}/set-active`)
    return response.data
  }
}

export default new AcademicYearsService()
