<template>
  <div class="card-templates-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Template Kartu Siswa</h1>
      <button class="btn btn-primary" @click="showCreateModal">
        <i class="bi bi-plus-circle"></i> Buat Template
      </button>
    </div>

    <!-- Templates List -->
    <div class="row" v-if="!loading && templates.length > 0">
      <div class="col-md-4 mb-3" v-for="template in templates" :key="template.id">
        <div class="card template-card" :class="{ 'border-primary': template.is_default }">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0">{{ template.name }}</h5>
              <span v-if="template.is_default" class="badge bg-primary">Default</span>
            </div>
            <p class="card-text text-muted small mb-3">{{ template.description || 'Tidak ada deskripsi' }}</p>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" @click="editTemplate(template)">
                <i class="bi bi-pencil"></i> Edit
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteTemplate(template.id)" :disabled="template.is_default">
                <i class="bi bi-trash"></i> Hapus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && templates.length === 0" class="text-center py-5">
      <i class="bi bi-credit-card text-muted" style="font-size: 3rem;"></i>
      <h5 class="text-muted mt-3">Belum ada template kartu</h5>
      <p class="text-muted">Buat template pertama untuk kartu siswa</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Template Editor Modal -->
    <div class="modal fade" id="templateEditorModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingTemplate ? 'Edit Template' : 'Buat Template Baru' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <!-- Template Settings -->
              <div class="col-md-4">
                <h6>Pengaturan Template</h6>
                <div class="mb-3">
                  <label class="form-label">Nama Template</label>
                  <input type="text" class="form-control" v-model="formData.name" />
                </div>
                <div class="mb-3">
                  <label class="form-label">Deskripsi</label>
                  <textarea class="form-control" rows="2" v-model="formData.description"></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label">Orientasi</label>
                  <select class="form-select" v-model="formData.orientation">
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
                <div class="row mb-3">
                  <div class="col-6">
                    <label class="form-label">Lebar (px)</label>
                    <input type="number" class="form-control" v-model.number="formData.card_width" min="100" />
                  </div>
                  <div class="col-6">
                    <label class="form-label">Tinggi (px)</label>
                    <input type="number" class="form-control" v-model.number="formData.card_height" min="100" />
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Background Image</label>
                  <input type="file" class="form-control" @change="handleFileChange" accept="image/*" ref="fileInput" />
                  <div v-if="backgroundPreview" class="mt-2 position-relative">
                    <img :src="backgroundPreview" class="img-thumbnail" style="max-width: 100%; max-height: 150px;" />
                    <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" @click="removeBackground">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Background Fit</label>
                  <select class="form-select" v-model="formData.background_fit">
                    <option value="cover">Cover (Penuh)</option>
                    <option value="contain">Contain (Tampil Semua)</option>
                    <option value="fill">Fill (Stretch)</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                <div class="mb-3 form-check">
                  <input type="checkbox" class="form-check-input" id="isDefault" v-model="formData.is_default" />
                  <label class="form-check-label" for="isDefault">Set sebagai template default</label>
                </div>

                <hr />

                <h6>Tambah Elemen</h6>
                <div class="d-grid gap-2">
                  <button class="btn btn-outline-secondary btn-sm" @click="addElement('photo')">
                    <i class="bi bi-person-square"></i> Foto
                  </button>
                  <button class="btn btn-outline-secondary btn-sm" @click="addElement('qrcode')">
                    <i class="bi bi-qr-code"></i> QR Code
                  </button>
                  <button class="btn btn-outline-secondary btn-sm" @click="addElement('barcode')">
                    <i class="bi bi-upc"></i> Barcode
                  </button>
                  <button class="btn btn-outline-secondary btn-sm" @click="addElement('text')">
                    <i class="bi bi-fonts"></i> Text
                  </button>
                </div>

                <div v-if="selectedElement" class="mt-3">
                  <hr />
                  <h6>Properti Elemen</h6>
                  <div class="mb-2">
                    <label class="form-label small">Tipe</label>
                    <input type="text" class="form-control form-control-sm" :value="selectedElement.type" readonly />
                  </div>
                  <div class="mb-2">
                    <label class="form-label small">X</label>
                    <input type="number" class="form-control form-control-sm" v-model.number="selectedElement.x" />
                  </div>
                  <div class="mb-2">
                    <label class="form-label small">Y</label>
                    <input type="number" class="form-control form-control-sm" v-model.number="selectedElement.y" />
                  </div>
                  <div class="mb-2">
                    <label class="form-label small">Width</label>
                    <input type="number" class="form-control form-control-sm" v-model.number="selectedElement.width" />
                  </div>
                  <div class="mb-2" v-if="selectedElement.type !== 'qrcode'">
                    <label class="form-label small">Height</label>
                    <input type="number" class="form-control form-control-sm" v-model.number="selectedElement.height" />
                  </div>
                  <div class="mb-2" v-if="selectedElement.type === 'text'">
                    <label class="form-label small">Text</label>
                    <input type="text" class="form-control form-control-sm" v-model="selectedElement.text" placeholder="Gunakan {nama_field} untuk data siswa" />
                    <small class="text-muted">Placeholder: {name}, {nis}, {nisn}, {date_of_birth}, {gender}, {address}, {card_number}, {rfid_code}, {parent_name}, {parent_phone}, {grade}, {class}, {department}, {school}</small>
                  </div>
                  <div class="mb-2" v-if="selectedElement.type === 'text'">
                    <label class="form-label small">Font Size</label>
                    <input type="number" class="form-control form-control-sm" v-model.number="selectedElement.fontSize" />
                  </div>
                  <div class="mb-2" v-if="selectedElement.type === 'text'">
                    <label class="form-label small">Font Weight</label>
                    <select class="form-select form-select-sm" v-model="selectedElement.fontWeight">
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                  <div class="mb-2" v-if="selectedElement.type === 'text'">
                    <label class="form-label small">Text Align</label>
                    <select class="form-select form-select-sm" v-model="selectedElement.textAlign">
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div class="mb-2" v-if="selectedElement.type === 'text'">
                    <label class="form-label small">Color</label>
                    <input type="color" class="form-control form-control-sm" v-model="selectedElement.color" />
                  </div>
                  <button class="btn btn-sm btn-danger mt-2" @click="removeElement">
                    <i class="bi bi-trash"></i> Hapus Elemen
                  </button>
                </div>
              </div>

              <!-- Canvas Editor -->
              <div class="col-md-8">
                <h6>Preview & Editor</h6>
                <div class="canvas-wrapper">
                  <div class="canvas-container" :class="formData.orientation">
                    <div
                      class="canvas-card"
                      ref="canvasCard"
                      :style="canvasStyle"
                      @click="deselectElement"
                    >
                    <!-- Elements -->
                    <div
                      v-for="(element, index) in formData.layout.elements"
                      :key="index"
                      class="canvas-element"
                      :class="{
                        'element-selected': selectedElement === element,
                        [`element-${element.type}`]: true
                      }"
                      :style="getElementStyle(element)"
                      @click.stop="selectElement(element)"
                      @mousedown="startDrag(element, $event)"
                    >
                      <!-- Photo Placeholder -->
                      <div v-if="element.type === 'photo'" class="photo-placeholder">
                        <i class="bi bi-person-circle"></i>
                        <span>Foto</span>
                      </div>

                      <!-- QR Code Placeholder -->
                      <div v-if="element.type === 'qrcode'" class="qrcode-placeholder">
                        <i class="bi bi-qr-code"></i>
                      </div>

                      <!-- Barcode Placeholder -->
                      <div v-if="element.type === 'barcode'" class="barcode-placeholder">
                        <div class="barcode-lines"></div>
                        <span>BARCODE</span>
                      </div>

                      <!-- Text -->
                      <div v-if="element.type === 'text'" class="text-element">
                        {{ element.text || 'Text' }}
                      </div>

                      <!-- Resize Handle -->
                      <div
                        v-if="selectedElement === element"
                        class="resize-handle"
                        @mousedown.stop="startResize(element, $event)"
                      ></div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Batal</button>
            <button type="button" class="btn btn-primary" @click="saveTemplate">
              <i class="bi bi-save"></i> Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import cardTemplateService from '../services/cardTemplateService';
import { Modal } from 'bootstrap';

const templates = ref([]);
const loading = ref(false);
const editingTemplate = ref(null);
const selectedElement = ref(null);
const modalInstance = ref(null);

const formData = ref({
  name: '',
  description: '',
  orientation: 'portrait',
  card_width: 300,
  card_height: 450,
  background_fit: 'cover',
  is_default: false,
  layout: {
    elements: []
  },
  backgroundFile: null
});

const fileInput = ref(null);
const backgroundPreview = ref('');
const dragging = ref(false);
const resizing = ref(false);
const dragStart = ref({ x: 0, y: 0 });

const canvasStyle = computed(() => {
  const styles = {
    width: formData.value.card_width + 'px',
    height: formData.value.card_height + 'px',
    backgroundSize: formData.value.background_fit,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
  
  if (backgroundPreview.value) {
    styles.backgroundImage = `url(${backgroundPreview.value})`;
  }
  
  return styles;
});

onMounted(() => {
  loadTemplates();
});

async function loadTemplates() {
  loading.value = true;
  try {
    const response = await cardTemplateService.getAll();
    templates.value = response.data;
  } catch (error) {
    alert('Gagal memuat template: ' + error.message);
  } finally {
    loading.value = false;
  }
}

function showCreateModal() {
  editingTemplate.value = null;
  formData.value = {
    name: '',
    description: '',
    orientation: 'portrait',
    card_width: 300,
    card_height: 450,
    background_fit: 'cover',
    is_default: false,
    layout: {
      elements: []
    },
    backgroundFile: null
  };
  selectedElement.value = null;
  backgroundPreview.value = '';
  
  modalInstance.value = new Modal(document.getElementById('templateEditorModal'));
  modalInstance.value.show();
}

async function editTemplate(template) {
  editingTemplate.value = template;
  formData.value = {
    name: template.name,
    description: template.description || '',
    orientation: template.orientation,
    card_width: template.card_width || 300,
    card_height: template.card_height || 450,
    background_fit: template.background_fit || 'cover',
    is_default: template.is_default,
    layout: JSON.parse(JSON.stringify(template.layout)),
    backgroundFile: null
  };
  selectedElement.value = null;
  
  // Load background preview if exists
  if (template.background_image) {
    try {
      const response = await cardTemplateService.getBackgroundUrl(template.id);
      backgroundPreview.value = response.data.url;
    } catch (error) {
      console.error('Error loading background:', error);
      backgroundPreview.value = '';
    }
  } else {
    backgroundPreview.value = '';
  }
  
  modalInstance.value = new Modal(document.getElementById('templateEditorModal'));
  modalInstance.value.show();
}

function closeModal() {
  if (modalInstance.value) {
    modalInstance.value.hide();
  }
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    formData.value.backgroundFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      backgroundPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function removeBackground() {
  formData.value.backgroundFile = null;
  backgroundPreview.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function addElement(type) {
  const newElement = {
    type,
    x: 50,
    y: 50,
    width: type === 'photo' ? 120 : type === 'qrcode' ? 80 : type === 'barcode' ? 200 : 150,
    height: type === 'photo' ? 150 : type === 'barcode' ? 60 : 30,
  };

  if (type === 'text') {
    newElement.text = 'Text';
    newElement.fontSize = 14;
    newElement.fontWeight = 'normal';
    newElement.textAlign = 'left';
    newElement.color = '#000000';
  }

  formData.value.layout.elements.push(newElement);
  selectedElement.value = newElement;
}

function selectElement(element) {
  selectedElement.value = element;
}

function deselectElement() {
  selectedElement.value = null;
}

function removeElement() {
  if (selectedElement.value) {
    const index = formData.value.layout.elements.indexOf(selectedElement.value);
    if (index > -1) {
      formData.value.layout.elements.splice(index, 1);
      selectedElement.value = null;
    }
  }
}

function getElementStyle(element) {
  return {
    left: element.x + 'px',
    top: element.y + 'px',
    width: element.width + 'px',
    height: element.height ? element.height + 'px' : 'auto',
    fontSize: element.fontSize ? element.fontSize + 'px' : '14px',
    fontWeight: element.fontWeight || 'normal',
  };
}

function startDrag(element, event) {
  selectedElement.value = element;
  dragging.value = true;
  dragStart.value = {
    x: event.clientX - element.x,
    y: event.clientY - element.y
  };

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

function onDrag(event) {
  if (dragging.value && selectedElement.value) {
    selectedElement.value.x = event.clientX - dragStart.value.x;
    selectedElement.value.y = event.clientY - dragStart.value.y;
  }
}

function stopDrag() {
  dragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

function startResize(element, event) {
  selectedElement.value = element;
  resizing.value = true;
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    width: element.width,
    height: element.height || 0
  };

  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
}

function onResize(event) {
  if (resizing.value && selectedElement.value) {
    const deltaX = event.clientX - dragStart.value.x;
    const deltaY = event.clientY - dragStart.value.y;
    
    selectedElement.value.width = Math.max(20, dragStart.value.width + deltaX);
    if (selectedElement.value.type !== 'qrcode') {
      selectedElement.value.height = Math.max(20, dragStart.value.height + deltaY);
    }
  }
}

function stopResize() {
  resizing.value = false;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
}

async function saveTemplate() {
  if (!formData.value.name) {
    alert('Nama template wajib diisi');
    return;
  }

  try {
    const data = new FormData();
    data.append('name', formData.value.name);
    data.append('description', formData.value.description);
    data.append('orientation', formData.value.orientation);
    data.append('card_width', formData.value.card_width);
    data.append('card_height', formData.value.card_height);
    data.append('background_fit', formData.value.background_fit);
    data.append('is_default', formData.value.is_default);
    data.append('layout', JSON.stringify(formData.value.layout));
    
    if (formData.value.backgroundFile) {
      data.append('background', formData.value.backgroundFile);
    }

    if (editingTemplate.value) {
      await cardTemplateService.update(editingTemplate.value.id, data);
      alert('Template berhasil diperbarui');
    } else {
      await cardTemplateService.create(data);
      alert('Template berhasil dibuat');
    }

    closeModal();
    loadTemplates();
  } catch (error) {
    alert('Gagal menyimpan template: ' + error.message);
  }
}

async function deleteTemplate(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus template ini?')) {
    return;
  }

  try {
    await cardTemplateService.delete(id);
    alert('Template berhasil dihapus');
    loadTemplates();
  } catch (error) {
    alert('Gagal menghapus template: ' + error.message);
  }
}
</script>

<style scoped>
.template-card {
  transition: transform 0.2s;
}

.template-card:hover {
  transform: translateY(-5px);
}

.canvas-wrapper {
  width: 100%;
  max-height: 70vh;
  overflow: auto;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  position: relative;
}

.canvas-container {
  display: inline-block;
  min-width: 100%;
  min-height: 100%;
  padding: 20px;
}

.canvas-card {
  position: relative;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  display: block;
}

.canvas-element {
  position: absolute;
  border: 1px dashed transparent;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}

.canvas-element:hover {
  border-color: #0d6efd;
}

.element-selected {
  border: 2px solid #0d6efd !important;
  background: rgba(13, 110, 253, 0.05);
}

.photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #e9ecef;
  font-size: 2rem;
  color: #6c757d;
}

.photo-placeholder span {
  font-size: 0.75rem;
  margin-top: 5px;
}

.qrcode-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: white;
  border: 1px solid #dee2e6;
  font-size: 2rem;
}

.barcode-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: white;
  border: 1px solid #dee2e6;
}

.barcode-lines {
  width: 80%;
  height: 60%;
  background: repeating-linear-gradient(
    90deg,
    #000 0px,
    #000 2px,
    #fff 2px,
    #fff 4px
  );
}

.barcode-placeholder span {
  font-size: 0.6rem;
  margin-top: 2px;
}

.text-element {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 5px;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #0d6efd;
  cursor: nwse-resize;
  border-radius: 2px;
}
</style>
