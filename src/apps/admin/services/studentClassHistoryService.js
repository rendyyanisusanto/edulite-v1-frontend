import apiClient from '../../../shared/utils/apiClient'

/**
 * Student Class History Service
 * Handle student class placement/assignment operations
 */
class StudentClassHistoryService {
  /**
   * Get all student class history with pagination and filters
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 10, max: 100)
   * @param {number} options.schoolId - School ID filter (optional)
   * @param {number} options.academicYearId - Academic year filter (optional)
   * @param {number} options.gradeId - Grade filter (optional)
   * @param {number} options.classId - Class filter (optional)
   * @returns {Promise<Object>} Paginated class history data
   */
  async getAll(options = {}) {
    const { page = 1, limit = 10, schoolId = null, academicYearId = null, gradeId = null, classId = null } = options
    const params = { page, limit }
    if (schoolId) params.school_id = schoolId
    if (academicYearId) params.academic_year_id = academicYearId
    if (gradeId) params.grade_id = gradeId
    if (classId) params.class_id = classId
    
    const response = await apiClient.get('/api/student-class-history', { params })
    return response.data
  }

  /**
   * Get class history by ID
   * @param {number} id - History ID
   * @returns {Promise<Object>} History data
   */
  async getById(id) {
    const response = await apiClient.get(`/api/student-class-history/${id}`)
    return response.data
  }

  /**
   * Create new class assignment
   * @param {Object} data - Assignment data
   * @returns {Promise<Object>} Created assignment
   */
  async create(data) {
    const response = await apiClient.post('/api/student-class-history', data)
    return response.data
  }

  /**
   * Bulk assign students to class
   * @param {Object} data - Bulk assignment data
   * @returns {Promise<Object>} Result
   */
  async bulkAssign(data) {
    const response = await apiClient.post('/api/student-class-history/bulk-assign', data)
    return response.data
  }

  /**
   * Update class assignment
   * @param {number} id - History ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated assignment
   */
  async update(id, data) {
    const response = await apiClient.put(`/api/student-class-history/${id}`, data)
    return response.data
  }

  /**
   * Delete class assignment
   * @param {number} id - History ID
   * @returns {Promise<Object>} Delete result
   */
  async delete(id) {
    const response = await apiClient.delete(`/api/student-class-history/${id}`)
    return response.data
  }
}

export default new StudentClassHistoryService()
