import apiClient from '../../../shared/utils/apiClient'

class ParentProfileService {
  // Get all parents (master data)
  async getAll(params = {}) {
    const response = await apiClient.get("/api/parent-profiles", { params });
    return response.data;
  }

  // Get all parents for a student
  async getByStudent(studentId) {
    const response = await apiClient.get(`/api/parent-profiles/student/${studentId}`);
    return response.data;
  }

  // Create or update parent
  async saveParent(studentId, data) {
    const response = await apiClient.post(`/api/parent-profiles/student/${studentId}`, data);
    return response.data;
  }

  // Delete parent
  async deleteParent(parentId) {
    const response = await apiClient.delete(`/api/parent-profiles/${parentId}`);
    return response.data;
  }

  // Upload document
  async uploadDocument(parentId, formData) {
    const response = await apiClient.post(`/api/parent-profiles/${parentId}/document`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // Delete document
  async deleteDocument(documentId) {
    const response = await apiClient.delete(`/api/parent-profiles/document/${documentId}`);
    return response.data;
  }
}

export default new ParentProfileService();
