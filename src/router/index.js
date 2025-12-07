import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from '../apps/auth/routes'
import { dashboardRoutes } from '../apps/dashboard/routes'
import { adminRoutes } from '../apps/admin/routes'
import { useAuthStore } from '../apps/auth/store/authStore'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/dashboard'
  },
  ...authRoutes,
  ...dashboardRoutes,
  ...adminRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard untuk proteksi route
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  if (requiresAuth && !token) {
    next('/login')
  } else if (requiresAdmin) {
    // Check if user is admin or superadmin
    const authStore = useAuthStore()
    const userRole = authStore.userRole
    
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      next('/dashboard')
    } else {
      next()
    }
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
