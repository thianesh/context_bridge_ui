import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthView from '@/views/AuthView.vue'
import RoomsView from '@/views/RoomsView.vue'
import MembersView from '@/views/MembersView.vue'
import CompanyView from '@/views/CompanyView.vue'
import Conference from '@/views/Conference.vue'
import EmptyView from '@/views/EmptyView.vue'
import ConferenceComponent from '@/views/Conference.vue'
import FeedBackView from '@/views/FeedBackView.vue'
import TimeLineView from '@/views/TimeLineView.vue'
import DownloadView from '@/views/DownloadView.vue'
import VisualAI from '@/views/VisualAI.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
     {
      path: '/visual_ai',
      name: 'visual_ai',
      component: VisualAI,
    },
    {
      path: '/',
      name: 'home',
      component: EmptyView,
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
      path: '/feedback',
      name: 'feedback',
      component: FeedBackView,
    },
     {
      path: '/conference/:room_id',
      name: 'conference',
      component: ConferenceComponent,
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: TimeLineView,
    },
    {
      path: '/download',
      name: "download",
      component: DownloadView
    },
  ],
})

export default router
