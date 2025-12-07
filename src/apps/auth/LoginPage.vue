<template>
  <div class="login-page">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-12 col-sm-10 col-md-7 col-lg-6 col-xl-6">
          <div class="login-card card shadow-lg border-0">
            <div class="card-body p-4 p-md-5">
              <!-- Brand Section -->
              <div class="brand text-center mb-4">
                <div class="logo-wrapper mb-3">
                  <div class="logo-circle">
                    <span class="logo-text">E</span>
                  </div>
                </div>
                <h2 class="brand-title fw-bold mb-1">EduLite</h2>
                <p class="brand-subtitle text-muted mb-0">Selamat datang kembali</p>
              </div>

              <!-- Login Form -->
              <form @submit.prevent="handleLogin" novalidate>
                <div class="mb-3">
                  <label for="email" class="form-label fw-medium">Email</label>
                  <div class="input-wrapper">
                    <span class="input-icon">
                      <i class="bi bi-envelope"></i>
                    </span>
                    <input
                      id="email"
                      type="email"
                      class="form-control"
                      v-model="formData.email"
                      placeholder="nama@example.com"
                      :class="{ 'is-invalid': emailError }"
                      autofocus
                      required
                    />
                  </div>
                  <div v-if="emailError" class="invalid-feedback d-block">
                    {{ emailError }}
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label fw-medium">Password</label>
                  <div class="input-wrapper position-relative">
                    <span class="input-icon">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      id="password"
                      class="form-control pe-5"
                      v-model="formData.password"
                      placeholder="Masukkan password"
                      :class="{ 'is-invalid': passwordError }"
                      required
                    />
                    <button
                      type="button"
                      class="password-toggle"
                      @click="togglePassword"
                      tabindex="-1"
                    >
                      <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                  <div v-if="passwordError" class="invalid-feedback d-block">
                    {{ passwordError }}
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-4">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="remember"
                      v-model="formData.remember"
                    />
                    <label class="form-check-label" for="remember">
                      Ingat saya
                    </label>
                  </div>
                  <a href="#" class="forgot-link">Lupa password?</a>
                </div>

                <div v-if="error" class="alert alert-danger d-flex align-items-center" role="alert">
                  <i class="bi bi-exclamation-circle me-2"></i>
                  <span>{{ error }}</span>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 mb-3"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Memproses...' : 'Masuk' }}
                </button>

                <div class="divider my-3">
                  <span>atau masuk dengan</span>
                </div>

                <div class="social-login d-flex gap-2">
                  <button type="button" class="btn btn-outline-google flex-fill">
                    <i class="bi bi-google"></i>
                    Google
                  </button>
                  <button type="button" class="btn btn-outline-facebook flex-fill">
                    <i class="bi bi-facebook"></i>
                    Facebook
                  </button>
                </div>
              </form>
            </div>

            <!-- Card Footer -->
            <div class="card-footer text-center py-3">
              <small class="text-muted">
                Belum punya akun? 
                <a href="#" class="register-link fw-medium">Daftar sekarang</a>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './store/authStore'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  email: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const loading = computed(() => authStore.loading)
const error = ref('')

const emailError = ref('')
const passwordError = ref('')

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const validate = () => {
  emailError.value = ''
  passwordError.value = ''
  error.value = ''

  if (!formData.value.email) {
    emailError.value = 'Email harus diisi.'
  } else if (!/^\S+@\S+\.\S+$/.test(formData.value.email)) {
    emailError.value = 'Email tidak valid.'
  }

  if (!formData.value.password) {
    passwordError.value = 'Password harus diisi.'
  } else if (formData.value.password.length < 6) {
    passwordError.value = 'Password minimal 6 karakter.'
  }

  return !emailError.value && !passwordError.value
}

const handleLogin = async () => {
  if (!validate()) return

  error.value = ''

  try {
    await authStore.login(formData.value)

    const user = authStore.currentUser || {}

    if (user.role === 'superadmin') {
      router.push('/dashboard')
    } else if (user.role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/home')
    }
  } catch (err) {
    error.value = (err && err.message) ? err.message : 'Login gagal. Silakan coba lagi.'
  }
}
</script>

<style scoped>
/* Base Colors */
:root {
  --brand-primary: #0652DD;
  --brand-dark: #0447bd;
  --brand-light: #4A90E2;
  --accent: #2d7ff9;
}

/* Page Background with Gradient Animation */
.login-page {
  min-height: 100vh;
  background: linear-gradient(-45deg, #0652DD, #2d7ff9, #4A90E2, #0652DD);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  position: relative;
  overflow: hidden;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Floating particles effect */
.login-page::before,
.login-page::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.login-page::before {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.login-page::after {
  width: 400px;
  height: 400px;
  bottom: -150px;
  right: -150px;
  animation-delay: 7s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

/* Login Card */
.login-card {
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.98);
  animation: slideUp 0.5s ease-out;
  box-shadow: 0 20px 60px rgba(6, 82, 221, 0.3);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card:hover {
  box-shadow: 0 25px 70px rgba(6, 82, 221, 0.35);
  transition: box-shadow 0.3s ease;
}

/* Brand Section */
.brand {
  animation: fadeIn 0.6s ease-out 0.2s both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.logo-wrapper {
  position: relative;
  display: inline-block;
}

.logo-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--brand-primary), var(--accent));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(6, 82, 221, 0.3);
  animation: pulse 2s ease-in-out infinite;
  position: relative;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 10px 30px rgba(6, 82, 221, 0.3); }
  50% { transform: scale(1.05); box-shadow: 0 15px 40px rgba(6, 82, 221, 0.4); }
}

.logo-text {
  color: #1877F2;;
  font-size: 2.5rem;
  font-weight: 700;
}

.brand-title {
  color: var(--brand-primary);
  font-size: 1.75rem;
}

.brand-subtitle {
  font-size: 0.95rem;
}

/* Form Inputs */
.form-label {
  color: #344054;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #667085;
  z-index: 2;
  font-size: 1.1rem;
}

.form-control {
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #fff;
}

.form-control:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 4px rgba(6, 82, 221, 0.1);
  outline: none;
  transform: translateY(-2px);
}

.form-control::placeholder {
  color: #9CA3AF;
}

/* Password Toggle */
.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #667085;
  cursor: pointer;
  padding: 0.25rem;
  z-index: 2;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: var(--brand-primary);
}

/* Checkbox */
.form-check-input:checked {
  background-color: var(--brand-primary);
  border-color: var(--brand-primary);
}

.form-check-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(6, 82, 221, 0.15);
}

/* Links */
.forgot-link,
.register-link {
  color: var(--brand-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.forgot-link:hover,
.register-link:hover {
  color: var(--brand-dark);
  text-decoration: underline;
}

/* Primary Button */
.btn-primary {
  /* background: linear-gradient(135deg, var(--brand-primary), var(--accent)); */
  border: none;
  padding: 0.875rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(6, 82, 221, 0.25);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s;
}

.btn-primary:hover:not(:disabled)::before {
  left: 100%;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(6, 82, 221, 0.35);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Divider */
.divider {
  position: relative;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: #E5E7EB;
}

.divider span {
  position: relative;
  background: white;
  padding: 0 1rem;
  color: #667085;
  font-size: 0.85rem;
}

/* Social Login Buttons */
.btn-outline-google,
.btn-outline-facebook {
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: white;
  color: #344054;
}

.btn-outline-google:hover {
  background: #f8f9fa;
  border-color: #DB4437;
  color: #DB4437;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(219, 68, 55, 0.2);
}

.btn-outline-facebook:hover {
  background: #f8f9fa;
  border-color: #1877F2;
  color: #1877F2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 119, 242, 0.2);
}

.btn-outline-google i,
.btn-outline-facebook i {
  margin-right: 0.5rem;
}

/* Card Footer */
.card-footer {
  background: #F9FAFB;
  border-top: 1px solid #E5E7EB;
}

/* Alert */
.alert {
  border-radius: 12px;
  border: none;
}

.alert-danger {
  background: #FEF2F2;
  color: #991B1B;
}

/* Responsive */
@media (max-width: 576px) {
  .login-card .card-body {
    padding: 2rem 1.5rem;
  }
  
  .logo-circle {
    width: 70px;
    height: 70px;
  }
  
  .logo-text {
    font-size: 2rem;
  }
  
  .brand-title {
    font-size: 1.5rem;
  }
}
</style>