import { createRouter, createWebHistory } from 'vue-router'
import Verify from '../views/Verify.vue'

const routes = [
  {
    path: '/',
    redirect: '/web_verify'
  },
  {
    path: '/web_verify',
    name: 'Verify',
    component: Verify
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
