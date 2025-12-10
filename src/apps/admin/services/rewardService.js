import apiClient from '../../../shared/utils/apiClient';

class RewardService {
  // ==================== REWARD LEVELS ====================
  
  async getAllLevels(params = {}) {
    const response = await apiClient.get('/api/rewards/levels', { params });
    return response.data;
  }

  async getLevelById(id) {
    const response = await apiClient.get(`/api/rewards/levels/${id}`);
    return response.data;
  }

  async createLevel(data) {
    const response = await apiClient.post('/api/rewards/levels', data);
    return response.data;
  }

  async updateLevel(id, data) {
    const response = await apiClient.put(`/api/rewards/levels/${id}`, data);
    return response.data;
  }

  async deleteLevel(id) {
    const response = await apiClient.delete(`/api/rewards/levels/${id}`);
    return response.data;
  }

  // ==================== REWARD TYPES ====================
  
  async getAllTypes(params = {}) {
    const response = await apiClient.get('/api/rewards/types', { params });
    return response.data;
  }

  async getTypeById(id) {
    const response = await apiClient.get(`/api/rewards/types/${id}`);
    return response.data;
  }

  async createType(data) {
    const response = await apiClient.post('/api/rewards/types', data);
    return response.data;
  }

  async updateType(id, data) {
    const response = await apiClient.put(`/api/rewards/types/${id}`, data);
    return response.data;
  }

  async deleteType(id) {
    const response = await apiClient.delete(`/api/rewards/types/${id}`);
    return response.data;
  }

  // ==================== REWARD ACTIONS ====================
  
  async getAllActions(params = {}) {
    const response = await apiClient.get('/api/rewards/actions', { params });
    return response.data;
  }

  async getActionById(id) {
    const response = await apiClient.get(`/api/rewards/actions/${id}`);
    return response.data;
  }

  async createAction(data) {
    const response = await apiClient.post('/api/rewards/actions', data);
    return response.data;
  }

  async updateAction(id, data) {
    const response = await apiClient.put(`/api/rewards/actions/${id}`, data);
    return response.data;
  }

  async deleteAction(id) {
    const response = await apiClient.delete(`/api/rewards/actions/${id}`);
    return response.data;
  }

  // ==================== STUDENT REWARDS ====================
  
  async getAllStudentRewards(params = {}) {
    const response = await apiClient.get('/api/rewards/students', { params });
    return response.data;
  }

  async getAllRewards(params = {}) {
    const response = await apiClient.get('/api/rewards/students', { params });
    return response.data;
  }

  async getStudentRewardById(id) {
    const response = await apiClient.get(`/api/rewards/students/${id}`);
    return response.data;
  }

  async createStudentReward(data) {
    const response = await apiClient.post('/api/rewards/students', data);
    return response.data;
  }

  async createReward(data) {
    const response = await apiClient.post('/api/rewards/students', data);
    return response.data;
  }

  async updateStudentReward(id, data) {
    const response = await apiClient.put(`/api/rewards/students/${id}`, data);
    return response.data;
  }

  async deleteStudentReward(id) {
    const response = await apiClient.delete(`/api/rewards/students/${id}`);
    return response.data;
  }

  async uploadEvidence(id, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/api/rewards/students/${id}/evidence`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async approveReward(id) {
    const response = await apiClient.post(`/api/rewards/students/${id}/approve`);
    return response.data;
  }

  async rejectReward(id, rejection_reason) {
    const response = await apiClient.post(`/api/rewards/students/${id}/reject`, { rejection_reason });
    return response.data;
  }

  async actionReward(id) {
    const response = await apiClient.post(`/api/rewards/students/${id}/action`);
    return response.data;
  }
}

export default new RewardService();
