// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import UserLogin from '@/components/UserLogin.vue';
import UserRegister from '@/components/UserRegister.vue';
import ChatPage from '@/components/chat/ChatPage.vue';
import Setting from '@/components/chat/set/Setting.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: UserLogin
    },
    {
      path: '/register',
      name: 'Register',
      component: UserRegister
    },
    {
      path: '/chat',
      name: 'Chat',
      component: ChatPage
    },
    {
      path: '/',
      redirect: '/login' // 默认跳到登录
    },
    {
      path: '/settings', // 路径可以自定义
      name: 'Settings',
      component: Setting
    }
  ]
});

export default router;