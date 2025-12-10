import apiClient from '../../../shared/utils/apiClient';

class CardTemplateService {
  /**
   * Get all card templates for user's school
   */
  async getAll() {
    try {
      const response = await apiClient.get('/api/card-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Get card template by ID
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`/api/card-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }

  /**
   * Get default card template
   */
  async getDefault() {
    try {
      const response = await apiClient.get('/api/card-templates/default');
      return response.data;
    } catch (error) {
      console.error('Error fetching default template:', error);
      throw error;
    }
  }

  /**
   * Create new card template
   */
  async create(formData) {
    try {
      const response = await apiClient.post('/api/card-templates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Update card template
   */
  async update(id, formData) {
    try {
      const response = await apiClient.put(`/api/card-templates/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  /**
   * Delete card template
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(`/api/card-templates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Get background image URL
   */
  async getBackgroundUrl(id) {
    try {
      const response = await apiClient.get(`/api/card-templates/${id}/background`);
      return response.data;
    } catch (error) {
      console.error('Error fetching background URL:', error);
      throw error;
    }
  }

  /**
   * Generate card number for student
   */
  async generateCardNumber(studentId) {
    try {
      const response = await apiClient.post(`/api/students/${studentId}/card/number`, {});
      return response.data;
    } catch (error) {
      console.error('Error generating card number:', error);
      throw error;
    }
  }

  /**
   * Generate QR code for student
   */
  async generateQRCode(studentId) {
    try {
      const response = await apiClient.post(`/api/students/${studentId}/card/qrcode`, {});
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Generate barcode for student
   */
  async generateBarcode(studentId) {
    try {
      const response = await apiClient.post(`/api/students/${studentId}/card/barcode`, {});
      return response.data;
    } catch (error) {
      console.error('Error generating barcode:', error);
      throw error;
    }
  }

  /**
   * Generate all card data (number, QR, barcode)
   */
  async generateAllCardData(studentId) {
    try {
      const response = await apiClient.post(`/api/students/${studentId}/card/generate`, {});
      return response.data;
    } catch (error) {
      console.error('Error generating card data:', error);
      throw error;
    }
  }

  /**
   * Assign card template to student
   */
  async assignTemplate(studentId, templateId) {
    try {
      const response = await apiClient.put(`/api/students/${studentId}/card/template`, { 
        card_template_id: templateId 
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning template:', error);
      throw error;
    }
  }

  /**
   * Get student card with template
   */
  async getStudentCard(studentId) {
    try {
      const response = await apiClient.get(`/api/students/${studentId}/card`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student card:', error);
      throw error;
    }
  }
}

export default new CardTemplateService();
