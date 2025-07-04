import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthView from '@/views/AuthView.vue'
import RoomsView from '@/views/RoomsView.vue'
import MembersView from '@/views/MembersView.vue'
import CompanyView from '@/views/CompanyView.vue'
import ChatView from '@/views/chatView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      // component: RoomsView,
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
    },
    {
      path: '/company',
      name: 'company',
      component: CompanyView,
    },
    {
      path: '/rooms',
      name: 'rooms',
      component: RoomsView,
    },
    {
      path: '/members',
      name: 'members',
      component: MembersView,
    },
     {
      path: '/chat',
      name: 'chat',
      component: ChatView,
    },
  ],
})

export default router
