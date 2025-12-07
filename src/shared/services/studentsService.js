import apiClient from '../utils/apiClient'

const studentsService = {
  async getAll(schoolId = null) {
    const params = schoolId ? { school_id: schoolId } : {}
    const response = await apiClient.get('/api/students', { params })
    return response.data
  },

  async getById(id) {
    const response = await apiClient.get(`/api/students/${id}`)
    return response.data
  },

  async create(data) {
    const response = await apiClient.post('/api/students', data)
    return response.data
  },

  async update(id, data) {
    const response = await apiClient.put(`/api/students/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await apiClient.delete(`/api/students/${id}`)
    return response.data
  },

  async uploadPhoto(id, formData) {
    const response = await apiClient.post(`/api/students/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

export default studentsService
