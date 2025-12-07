import DashboardLayout from './DashboardLayout.vue'
import DashboardPage from './DashboardPage.vue'

export const dashboardRoutes = [
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: {
      requiresAuth: true,
      title: 'Dashboard - EduLite'
    },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashboardPage
      },
      // Tambahkan child routes lain di sini
      // {
      //   path: 'students',
      //   name: 'Students',
      //   component: () => import('./pages/StudentsPage.vue')
      // }
    ]
  }
]
