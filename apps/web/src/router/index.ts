import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../lib/auth'

const routerBase = import.meta.env.VITE_ROUTER_BASE_PATH ?? '/'

const router = createRouter({
  history: createWebHistory(routerBase),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/LoginPage.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/RegisterPage.vue'),
    },
    {
      path: '/app',
      name: 'app',
      component: () => import('../pages/ChatPage.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../pages/SettingsPage.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const authenticated = isAuthenticated()

  if ((to.name === 'app' || to.name === 'settings') && !authenticated) {
    return { name: 'login' }
  }

  if ((to.name === 'login' || to.name === 'register') && authenticated) {
    return { name: 'app' }
  }
})

export default router
