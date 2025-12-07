import apiClient from '../../../shared/utils/apiClient'

const achievementsService = {
  // Achievements
  async getAll(schoolId = null) {
    const params = schoolId ? { school_id: schoolId } : {}
    const response = await apiClient.get('/api/achievements', { params })
    return response.data
  },

  async getById(id) {
    const response = await apiClient.get(`/api/achievements/${id}`)
    return response.data
  },

  async create(data) {
    const response = await apiClient.post('/api/achievements', data)
    return response.data
  },

  async update(id, data) {
    const response = await apiClient.put(`/api/achievements/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await apiClient.delete(`/api/achievements/${id}`)
    return response.data
  },

  // Participants
  async addParticipant(achievementId, data) {
    const response = await apiClient.post(`/api/achievements/${achievementId}/participants`, data)
    return response.data
  },

  async updateParticipant(achievementId, participantId, data) {
    const response = await apiClient.put(`/api/achievements/${achievementId}/participants/${participantId}`, data)
    return response.data
  },

  async deleteParticipant(achievementId, participantId) {
    const response = await apiClient.delete(`/api/achievements/${achievementId}/participants/${participantId}`)
    return response.data
  },

  // Results
  async addResult(achievementId, participantId, data) {
    const response = await apiClient.post(`/api/achievements/${achievementId}/participants/${participantId}/results`, data)
    return response.data
  },

  async updateResult(achievementId, participantId, resultId, data) {
    const response = await apiClient.put(`/api/achievements/${achievementId}/participants/${participantId}/results/${resultId}`, data)
    return response.data
  },

  async deleteResult(achievementId, participantId, resultId) {
    const response = await apiClient.delete(`/api/achievements/${achievementId}/participants/${participantId}/results/${resultId}`)
    return response.data
  },

  // Certificates
  async uploadCertificate(achievementId, participantId, resultId, formData) {
    const response = await apiClient.post(
      `/api/achievements/${achievementId}/participants/${participantId}/results/${resultId}/certificate`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },

  async deleteCertificate(achievementId, participantId, resultId) {
    const response = await apiClient.delete(`/api/achievements/${achievementId}/participants/${participantId}/results/${resultId}/certificate`)
    return response.data
  },

  // Documents
  async uploadDocument(achievementId, formData) {
    const response = await apiClient.post(`/api/achievements/${achievementId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async deleteDocument(achievementId, documentId) {
    const response = await apiClient.delete(`/api/achievements/${achievementId}/documents/${documentId}`)
    return response.data
  },

  // Statistics
  async getStatistics(params = {}) {
    const response = await apiClient.get('/api/achievements/statistics', { params })
    return response.data
  }
}

export default achievementsService
