import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthView from '@/views/AuthView.vue'
import RoomsView from '@/views/RoomsView.vue'
import MembersView from '@/views/MembersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomeView,
    // },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
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
  ],
})

export default router
