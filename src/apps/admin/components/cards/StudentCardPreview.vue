<template>
  <div class="card-preview-container">
    <div
      class="student-card"
      :class="cardOrientation"
      :style="cardStyle"
    >
      <!-- Background Image -->
      <div v-if="backgroundUrl" class="card-background" :style="getBackgroundStyle()"></div>

      <!-- Elements -->
      <div v-for="(element, index) in elements" :key="index" class="card-element" :style="getElementStyle(element)">
        <!-- Photo -->
        <img v-if="element.type === 'photo' && student.photo" :src="student.photo" alt="Photo" class="element-photo" />
        <div v-else-if="element.type === 'photo'" class="photo-placeholder">
          <i class="bi bi-person-circle"></i>
        </div>

        <!-- QR Code -->
        <img v-if="element.type === 'qrcode' && student.qr_code" :src="student.qr_code" alt="QR Code" class="element-qrcode" />

        <!-- Barcode -->
        <img v-if="element.type === 'barcode' && student.barcode" :src="student.barcode" alt="Barcode" class="element-barcode" />

        <!-- Text -->
        <div v-if="element.type === 'text'" class="element-text">
          {{ parseText(element.text) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import cardTemplateService from '../../services/cardTemplateService';

const props = defineProps({
  student: {
    type: Object,
    required: true
  },
  template: {
    type: Object,
    required: true
  }
});

const backgroundUrl = ref('');
const backgroundDataUrl = ref('');

const cardOrientation = computed(() => {
  return props.template.orientation || 'portrait';
});

const elements = computed(() => {
  return props.template.layout?.elements || [];
});

async function loadBackgroundAsDataUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}

onMounted(async () => {
  if (props.template.background_image) {
    try {
      const response = await cardTemplateService.getBackgroundUrl(props.template.id);
      backgroundUrl.value = response.data.url;
      
      // Convert to data URL for html2canvas
      try {
        backgroundDataUrl.value = await loadBackgroundAsDataUrl(response.data.url);
      } catch (err) {
        console.error('Error converting background to data URL:', err);
        backgroundDataUrl.value = response.data.url;
      }
    } catch (error) {
      console.error('Error loading background:', error);
    }
  }
});

const cardStyle = computed(() => {
  return {
    width: props.template.card_width ? props.template.card_width + 'px' : (cardOrientation.value === 'portrait' ? '300px' : '400px'),
    height: props.template.card_height ? props.template.card_height + 'px' : (cardOrientation.value === 'portrait' ? '450px' : '300px'),
  };
});

function getBackgroundStyle() {
  return {
    backgroundImage: `url(${backgroundDataUrl.value || backgroundUrl.value})`,
    backgroundSize: props.template.background_fit || 'cover',
  };
}

function getElementStyle(element) {
  return {
    left: element.x + 'px',
    top: element.y + 'px',
    width: element.width + 'px',
    height: element.height ? element.height + 'px' : 'auto',
    fontSize: element.fontSize ? element.fontSize + 'px' : '14px',
    fontWeight: element.fontWeight || 'normal',
    textAlign: element.textAlign || 'left',
    color: element.color || '#000000',
  };
}

function parseText(text) {
  if (!text) return '';
  
  // Format date of birth if exists
  let dateOfBirth = '';
  if (props.student.date_of_birth) {
    const date = new Date(props.student.date_of_birth);
    dateOfBirth = date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  // Format gender
  const genderMap = {
    'L': 'Laki-laki',
    'P': 'Perempuan',
    'male': 'Laki-laki',
    'female': 'Perempuan'
  };
  const gender = genderMap[props.student.gender] || props.student.gender || '';
  
  // Replace placeholders with actual student data
  return text
    .replace(/\{name\}/g, props.student.name || '')
    .replace(/\{nis\}/g, props.student.nis || '')
    .replace(/\{nisn\}/g, props.student.nisn || '')
    .replace(/\{date_of_birth\}/g, dateOfBirth)
    .replace(/\{gender\}/g, gender)
    .replace(/\{address\}/g, props.student.address || '')
    .replace(/\{parent_name\}/g, props.student.parent_name || '')
    .replace(/\{parent_phone\}/g, props.student.parent_phone || '')
    .replace(/\{card_number\}/g, props.student.card_number || '')
    .replace(/\{rfid_code\}/g, props.student.rfid_code || '')
    .replace(/\{class\}/g, props.student.class?.name || '')
    .replace(/\{grade\}/g, props.student.grade?.name || '')
    .replace(/\{department\}/g, props.student.department?.name || '')
    .replace(/\{school\}/g, props.student.school?.name || '');
}
</script>

<style scoped>
.card-preview-container {
  display: inline-block;
}

.student-card {
  position: relative;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

.card-element {
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.element-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  font-size: 3rem;
  color: #6c757d;
  border-radius: 4px;
}

.element-qrcode,
.element-barcode {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.element-text {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 5px;
  word-wrap: break-word;
}

@media print {
  .card-preview-container {
    padding: 0;
  }

  .student-card {
    box-shadow: none;
    border: none;
  }
}
</style>
