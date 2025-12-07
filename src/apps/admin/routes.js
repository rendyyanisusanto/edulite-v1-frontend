import AdminLayout from './AdminLayout.vue'
import AdminDashboardPage from './pages/AdminDashboardPage.vue'

export const adminRoutes = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Admin Panel - EduLite'
    },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboardPage
      },
      // Analytics
      {
        path: 'analytics',
        name: 'AdminAnalytics',
        component: () => import('./pages/AnalyticsPage.vue')
      },
      // Reports
      {
        path: 'reports',
        name: 'AdminReports',
        component: () => import('./pages/ReportsPage.vue')
      },
      // Schools Management
      {
        path: 'schools',
        name: 'AdminSchools',
        component: () => import('./pages/SchoolsPage.vue')
      },
      // Academic Years
      {
        path: 'academic-years',
        name: 'AdminAcademicYears',
        component: () => import('./pages/AcademicYearsPage.vue')
      },
      // Grades
      {
        path: 'grades',
        name: 'AdminGrades',
        component: () => import('./pages/GradesPage.vue')
      },
      // Departments
      {
        path: 'departments',
        name: 'AdminDepartments',
        component: () => import('./pages/DepartmentsPage.vue')
      },
      // Classes
      {
        path: 'classes',
        name: 'AdminClasses',
        component: () => import('./pages/ClassesPage.vue')
      },
      // Students
      {
        path: 'students',
        name: 'AdminStudents',
        component: () => import('./pages/StudentsPage.vue')
      },
      // Student Mutations
      {
        path: 'student-mutations',
        name: 'AdminStudentMutations',
        component: () => import('./pages/StudentMutationsPage.vue')
      },
      // Class Placements
      {
        path: 'class-placements',
        name: 'AdminClassPlacements',
        component: () => import('./pages/ClassPlacementsPage.vue')
      },
      // Teachers
      {
        path: 'teachers',
        name: 'AdminTeachers',
        component: () => import('./pages/TeachersPage.vue')
      },
      // Achievements
      {
        path: 'achievements',
        name: 'AdminAchievements',
        component: () => import('./pages/AchievementsPage.vue')
      },
      {
        path: 'achievements/:id',
        name: 'AdminAchievementDetail',
        component: () => import('./pages/AchievementDetailPage.vue')
      },
      {
        path: 'achievement-reports',
        name: 'AdminAchievementReports',
        component: () => import('./pages/AchievementReportsPage.vue')
      },
      // Guestbooks
      {
        path: 'guestbooks',
        name: 'AdminGuestbooks',
        component: () => import('./pages/GuestbooksPage.vue')
      },
      {
        path: 'guestbook-reports',
        name: 'AdminGuestbookReports',
        component: () => import('./pages/GuestbookReportsPage.vue')
      },
      // Incoming Letters
      {
        path: 'incoming-letters',
        name: 'AdminIncomingLetters',
        component: () => import('./pages/IncomingLettersPage.vue')
      },
      {
        path: 'incoming-letters/:id',
        name: 'AdminIncomingLetterDetail',
        component: () => import('./pages/IncomingLetterDetailPage.vue')
      },
      // Outgoing Letters
      {
        path: 'outgoing-letters',
        name: 'AdminOutgoingLetters',
        component: () => import('./pages/OutgoingLettersPage.vue')
      },
      {
        path: 'outgoing-letters/:id',
        name: 'AdminOutgoingLetterDetail',
        component: () => import('./pages/OutgoingLetterDetailPage.vue')
      },
      // Users Management
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('./pages/UsersPage.vue')
      },
      // Roles & Permissions
      {
        path: 'roles',
        name: 'AdminRoles',
        component: () => import('./pages/RolesPage.vue')
      },
      // Subscriptions
      {
        path: 'subscriptions',
        name: 'AdminSubscriptions',
        component: () => import('./pages/SubscriptionsPage.vue')
      },
      // Settings
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('./pages/SettingsPage.vue')
      },
      // Activity Logs
      {
        path: 'logs',
        name: 'AdminLogs',
        component: () => import('./pages/LogsPage.vue')
      },
      // Backups
      {
        path: 'backups',
        name: 'AdminBackups',
        component: () => import('./pages/BackupsPage.vue')
      },
      // Notifications
      {
        path: 'notifications',
        name: 'AdminNotifications',
        component: () => import('./pages/NotificationsPage.vue')
      }
    ]
  }
]
