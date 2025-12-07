import apiClient from '../../../shared/utils/apiClient'

const incomingLetterService = {
  // Get all incoming letters
  async getAll(params = {}) {
    const response = await apiClient.get('/api/incoming-letters', { params })
    return response.data
  },

  // Get incoming letter by ID
  async getById(id) {
    const response = await apiClient.get(`/api/incoming-letters/${id}`)
    return response.data
  },

  // Create incoming letter
  async create(data) {
    const response = await apiClient.post('/api/incoming-letters', data)
    return response.data
  },

  // Update incoming letter
  async update(id, data) {
    const response = await apiClient.put(`/api/incoming-letters/${id}`, data)
    return response.data
  },

  // Update letter status
  async updateStatus(id, status) {
    const response = await apiClient.patch(`/api/incoming-letters/${id}/status`, { status })
    return response.data
  },

  // Delete incoming letter
  async delete(id) {
    const response = await apiClient.delete(`/api/incoming-letters/${id}`)
    return response.data
  },

  // Upload attachment
  async uploadAttachment(id, formData) {
    const response = await apiClient.post(
      `/api/incoming-letters/${id}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },

  // Delete attachment
  async deleteAttachment(id, attachmentId) {
    const response = await apiClient.delete(
      `/api/incoming-letters/${id}/attachments/${attachmentId}`
    )
    return response.data
  },

  // Create disposition
  async createDisposition(id, data) {
    const response = await apiClient.post(
      `/api/incoming-letters/${id}/dispositions`,
      data
    )
    return response.data
  },

  // Update disposition status
  async updateDispositionStatus(id, dispositionId, status) {
    const response = await apiClient.patch(
      `/api/incoming-letters/${id}/dispositions/${dispositionId}/status`,
      { status }
    )
    return response.data
  }
}

export default incomingLetterService
