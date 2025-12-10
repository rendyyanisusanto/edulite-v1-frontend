import apiClient from '../../../shared/utils/apiClient'

/**
 * Student Documents Service
 * Handle all student documents and document types CRUD operations
 */
class StudentDocumentsService {
  // ==================== DOCUMENT TYPES ====================
  
  /**
   * Get all document types
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Document types data
   */
  async getAllTypes(options = {}) {
    const response = await apiClient.get('/api/student-documents/types', { params: options })
    return response.data
  }

  /**
   * Get document type by ID
   * @param {number} id - Document type ID
   * @returns {Promise<Object>} Document type data
   */
  async getTypeById(id) {
    const response = await apiClient.get(`/api/student-documents/types/${id}`)
    return response.data
  }

  /**
   * Create new document type
   * @param {Object} data - Document type data
   * @returns {Promise<Object>} Created document type
   */
  async createType(data) {
    const response = await apiClient.post('/api/student-documents/types', data)
    return response.data
  }

  /**
   * Update document type
   * @param {number} id - Document type ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated document type
   */
  async updateType(id, data) {
    const response = await apiClient.put(`/api/student-documents/types/${id}`, data)
    return response.data
  }

  /**
   * Delete document type
   * @param {number} id - Document type ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteType(id) {
    const response = await apiClient.delete(`/api/student-documents/types/${id}`)
    return response.data
  }

  // ==================== STUDENT DOCUMENTS ====================

  /**
   * Get all student documents with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated student documents data
   */
  async getAll(options = {}) {
    const response = await apiClient.get('/api/student-documents', { params: options })
    return response.data
  }

  /**
   * Get student documents by student ID
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} Student documents data
   */
  async getByStudentId(studentId) {
    const response = await apiClient.get(`/api/student-documents/student/${studentId}`)
    return response.data
  }

  /**
   * Get student document by ID
   * @param {number} id - Document ID
   * @returns {Promise<Object>} Student document data
   */
  async getById(id) {
    const response = await apiClient.get(`/api/student-documents/${id}`)
    return response.data
  }

  /**
   * Create new student document
   * @param {Object} data - Student document data
   * @returns {Promise<Object>} Created student document
   */
  async create(data) {
    const response = await apiClient.post('/api/student-documents', data)
    return response.data
  }

  /**
   * Update student document
   * @param {number} id - Document ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated student document
   */
  async update(id, data) {
    const response = await apiClient.put(`/api/student-documents/${id}`, data)
    return response.data
  }

  /**
   * Delete student document
   * @param {number} id - Document ID
   * @returns {Promise<Object>} Delete result
   */
  async delete(id) {
    const response = await apiClient.delete(`/api/student-documents/${id}`)
    return response.data
  }

  /**
   * Upload document file
   * @param {number} id - Document ID
   * @param {File} file - Document file
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(id, file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post(
      `/api/student-documents/${id}/upload`,
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
   * Delete document file
   * @param {number} id - Document ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(id) {
    const response = await apiClient.delete(`/api/student-documents/${id}/file`)
    return response.data
  }

  /**
   * Get statistics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Statistics data
   */
  async getStatistics(options = {}) {
    const response = await apiClient.get('/api/student-documents/statistics', { params: options })
    return response.data
  }
}

export default new StudentDocumentsService()
