import apiClient from '../../../shared/utils/apiClient'

/**
 * Violation Service
 * Handle all violation-related CRUD operations
 */
class ViolationService {
  // ==================== VIOLATION LEVELS ====================
  
  /**
   * Get all violation levels with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated violation levels
   */
  async getAllLevels(options = {}) {
    const response = await apiClient.get('/api/violations/levels', { params: options })
    return response.data
  }

  /**
   * Get violation level by ID
   * @param {number} id - Level ID
   * @returns {Promise<Object>} Violation level data
   */
  async getLevelById(id) {
    const response = await apiClient.get(`/api/violations/levels/${id}`)
    return response.data
  }

  /**
   * Create new violation level
   * @param {Object} data - Level data
   * @returns {Promise<Object>} Created level
   */
  async createLevel(data) {
    const response = await apiClient.post('/api/violations/levels', data)
    return response.data
  }

  /**
   * Update violation level
   * @param {number} id - Level ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated level
   */
  async updateLevel(id, data) {
    const response = await apiClient.put(`/api/violations/levels/${id}`, data)
    return response.data
  }

  /**
   * Delete violation level
   * @param {number} id - Level ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteLevel(id) {
    const response = await apiClient.delete(`/api/violations/levels/${id}`)
    return response.data
  }

  // ==================== VIOLATION TYPES ====================
  
  /**
   * Get all violation types with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated violation types
   */
  async getAllTypes(options = {}) {
    const response = await apiClient.get('/api/violations/types', { params: options })
    return response.data
  }

  /**
   * Get violation type by ID
   * @param {number} id - Type ID
   * @returns {Promise<Object>} Violation type data
   */
  async getTypeById(id) {
    const response = await apiClient.get(`/api/violations/types/${id}`)
    return response.data
  }

  /**
   * Create new violation type
   * @param {Object} data - Type data
   * @returns {Promise<Object>} Created type
   */
  async createType(data) {
    const response = await apiClient.post('/api/violations/types', data)
    return response.data
  }

  /**
   * Update violation type
   * @param {number} id - Type ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated type
   */
  async updateType(id, data) {
    const response = await apiClient.put(`/api/violations/types/${id}`, data)
    return response.data
  }

  /**
   * Delete violation type
   * @param {number} id - Type ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteType(id) {
    const response = await apiClient.delete(`/api/violations/types/${id}`)
    return response.data
  }

  // ==================== VIOLATION ACTIONS ====================
  
  /**
   * Get all violation actions with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated violation actions
   */
  async getAllActions(options = {}) {
    const response = await apiClient.get('/api/violations/actions', { params: options })
    return response.data
  }

  /**
   * Get violation action by ID
   * @param {number} id - Action ID
   * @returns {Promise<Object>} Violation action data
   */
  async getActionById(id) {
    const response = await apiClient.get(`/api/violations/actions/${id}`)
    return response.data
  }

  /**
   * Create new violation action
   * @param {Object} data - Action data
   * @returns {Promise<Object>} Created action
   */
  async createAction(data) {
    const response = await apiClient.post('/api/violations/actions', data)
    return response.data
  }

  /**
   * Update violation action
   * @param {number} id - Action ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated action
   */
  async updateAction(id, data) {
    const response = await apiClient.put(`/api/violations/actions/${id}`, data)
    return response.data
  }

  /**
   * Delete violation action
   * @param {number} id - Action ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteAction(id) {
    const response = await apiClient.delete(`/api/violations/actions/${id}`)
    return response.data
  }

  // ==================== STUDENT VIOLATIONS ====================
  
  /**
   * Get all student violations with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated student violations
   */
  async getAllViolations(options = {}) {
    const response = await apiClient.get('/api/violations/students', { params: options })
    return response.data
  }

  /**
   * Get student violation by ID
   * @param {number} id - Violation ID
   * @returns {Promise<Object>} Student violation data
   */
  async getViolationById(id) {
    const response = await apiClient.get(`/api/violations/students/${id}`)
    return response.data
  }

  /**
   * Create new student violation
   * @param {Object} data - Violation data
   * @returns {Promise<Object>} Created violation
   */
  async createViolation(data) {
    const response = await apiClient.post('/api/violations/students', data)
    return response.data
  }

  /**
   * Update student violation
   * @param {number} id - Violation ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated violation
   */
  async updateViolation(id, data) {
    const response = await apiClient.put(`/api/violations/students/${id}`, data)
    return response.data
  }

  /**
   * Approve or reject student violation
   * @param {number} id - Violation ID
   * @param {Object} data - Approval data (status, action_id)
   * @returns {Promise<Object>} Updated violation
   */
  async approveViolation(id, data) {
    const response = await apiClient.put(`/api/violations/students/${id}/approve`, data)
    return response.data
  }

  /**
   * Upload evidence file for violation
   * @param {number} id - Violation ID
   * @param {FormData} formData - Form data with evidence file
   * @returns {Promise<Object>} Upload result
   */
  async uploadEvidence(id, formData) {
    const response = await apiClient.post(
      `/api/violations/students/${id}/evidence`,
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
   * Delete student violation
   * @param {number} id - Violation ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteViolation(id) {
    const response = await apiClient.delete(`/api/violations/students/${id}`)
    return response.data
  }

  /**
   * Get violation statistics by student
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} Violation statistics
   */
  async getStatsByStudent(studentId) {
    const response = await apiClient.get(`/api/violations/students/${studentId}/stats`)
    return response.data
  }
}

export default new ViolationService()
