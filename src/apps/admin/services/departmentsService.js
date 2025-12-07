import apiClient from '../../../shared/utils/apiClient'

/**
 * Departments Service
 * Handle all departments CRUD operations
 */
class DepartmentsService {
  /**
   * Get all departments
   * @param {number} schoolId - School ID filter
   * @returns {Promise<Array>} List of departments
   */
  async getAll(schoolId = null) {
    const params = schoolId ? { school_id: schoolId } : {}
    const response = await apiClient.get('/api/departments', { params })
    return response.data
  }

  /**
   * Get department by ID
   * @param {number} id - Department ID
   * @returns {Promise<Object>} Department data
   */
  async getById(id) {
    const response = await apiClient.get(`/api/departments/${id}`)
    return response.data
  }

  /**
   * Create new department
   * @param {Object} data - Department data
   * @returns {Promise<Object>} Created department
   */
  async create(data) {
    const response = await apiClient.post('/api/departments', data)
    return response.data
  }

  /**
   * Update department
   * @param {number} id - Department ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated department
   */
  async update(id, data) {
    const response = await apiClient.put(`/api/departments/${id}`, data)
    return response.data
  }

  /**
   * Delete department
   * @param {number} id - Department ID
   * @returns {Promise<Object>} Delete result
   */
  async delete(id) {
    const response = await apiClient.delete(`/api/departments/${id}`)
    return response.data
  }
}

export default new DepartmentsService()
