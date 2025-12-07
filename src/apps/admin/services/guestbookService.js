import apiClient from '../../../shared/utils/apiClient'

const guestbookService = {
  // Get all guestbooks with pagination and filters
  async getAll(params = {}) {
    const response = await apiClient.get('/api/guestbooks', { params })
    return response.data
  },

  // Get guestbook by ID
  async getById(id) {
    const response = await apiClient.get(`/api/guestbooks/${id}`)
    return response.data
  },

  // Create new guestbook entry (check-in)
  async create(data) {
    const response = await apiClient.post('/api/guestbooks', data)
    return response.data
  },

  // Update guestbook entry
  async update(id, data) {
    const response = await apiClient.put(`/api/guestbooks/${id}`, data)
    return response.data
  },

  // Check-out guest
  async checkout(id, data = {}) {
    const response = await apiClient.post(`/api/guestbooks/${id}/checkout`, data)
    return response.data
  },

  // Delete guestbook entry
  async delete(id) {
    const response = await apiClient.delete(`/api/guestbooks/${id}`)
    return response.data
  },

  // Get statistics
  async getStatistics(params = {}) {
    const response = await apiClient.get('/api/guestbooks/statistics', { params })
    return response.data
  }
}

export default guestbookService
