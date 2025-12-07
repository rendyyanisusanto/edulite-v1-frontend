import LoginPage from './LoginPage.vue'

export const authRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: {
      requiresAuth: false,
      title: 'Login - EduLite'
    }
  }
  // Tambahkan route lain seperti register, forgot-password, dll
]
