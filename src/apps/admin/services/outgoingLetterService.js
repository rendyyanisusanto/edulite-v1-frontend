import apiClient from '../../../shared/utils/apiClient'

const outgoingLetterService = {
  // Get all outgoing letters
  async getAll(params = {}) {
    const response = await apiClient.get('/api/outgoing-letters', { params })
    return response.data
  },

  // Get outgoing letter by ID
  async getById(id) {
    const response = await apiClient.get(`/api/outgoing-letters/${id}`)
    return response.data
  },

  // Create outgoing letter
  async create(data) {
    const response = await apiClient.post('/api/outgoing-letters', data)
    return response.data
  },

  // Update outgoing letter
  async update(id, data) {
    const response = await apiClient.put(`/api/outgoing-letters/${id}`, data)
    return response.data
  },

  // Submit for approval
  async submitForApproval(id) {
    const response = await apiClient.post(`/api/outgoing-letters/${id}/submit`)
    return response.data
  },

  // Approve or reject letter
  async approveOrReject(id, action, notes = '') {
    const response = await apiClient.post(
      `/api/outgoing-letters/${id}/approve-reject`,
      { action, notes }
    )
    return response.data
  },

  // Send letter
  async send(id, notes = '') {
    const response = await apiClient.post(
      `/api/outgoing-letters/${id}/send`,
      { notes }
    )
    return response.data
  },

  // Archive letter
  async archive(id) {
    const response = await apiClient.post(`/api/outgoing-letters/${id}/archive`)
    return response.data
  },

  // Delete outgoing letter
  async delete(id) {
    const response = await apiClient.delete(`/api/outgoing-letters/${id}`)
    return response.data
  },

  // Upload attachment
  async uploadAttachment(id, formData) {
    const response = await apiClient.post(
      `/api/outgoing-letters/${id}/attachments`,
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
      `/api/outgoing-letters/${id}/attachments/${attachmentId}`
    )
    return response.data
  }
}

export default outgoingLetterService
