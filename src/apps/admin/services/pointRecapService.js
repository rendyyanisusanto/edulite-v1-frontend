import apiClient from '../../../shared/utils/apiClient';

/**
 * Point Recap Service
 * Handle rekapitulasi poin pelanggaran dan reward siswa
 */
class PointRecapService {
  
  /**
   * Get student point recap dengan filter
   * @param {Object} params - Filter parameters
   * @returns {Promise<Object>} Student point recap data with pagination
   */
  async getStudentPointRecap(params = {}) {
    const response = await apiClient.get('/api/point-recap/students', { params });
    return response.data;
  }

  /**
   * Get student point detail
   * @param {number} studentId - Student ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Student point detail
   */
  async getStudentPointDetail(studentId, params = {}) {
    const response = await apiClient.get(`/api/point-recap/students/${studentId}`, { params });
    return response.data;
  }

  /**
   * Get class point recap
   * @param {Object} params - Filter parameters
   * @returns {Promise<Object>} Class point recap data
   */
  async getClassPointRecap(params = {}) {
    const response = await apiClient.get('/api/point-recap/classes', { params });
    return response.data;
  }

  /**
   * Get grade point recap
   * @param {Object} params - Filter parameters
   * @returns {Promise<Object>} Grade point recap data
   */
  async getGradePointRecap(params = {}) {
    const response = await apiClient.get('/api/point-recap/grades', { params });
    return response.data;
  }

  /**
   * Calculate/recalculate point recap
   * @param {Object} data - Calculation data
   * @returns {Promise<Object>} Calculation result
   */
  async calculatePointRecap(data) {
    const response = await apiClient.post('/api/point-recap/calculate', data);
    return response.data;
  }

  /**
   * Get dashboard statistics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats(params = {}) {
    const response = await apiClient.get('/api/point-recap/dashboard', { params });
    return response.data;
  }

  /**
   * Export point recap data
   * @param {Object} params - Export parameters
   * @returns {Promise<Object>} Export data
   */
  async exportPointRecap(params = {}) {
    const response = await apiClient.get('/api/point-recap/export', { params });
    return response.data;
  }
}

export default new PointRecapService();
