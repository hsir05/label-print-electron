import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  //  hash 模式。
  history: createWebHashHistory(),
  routes: [
    // 设置首页
    {
      path: '/',
      component: () => import('../page/index.vue')
    },
    { 
        path: '/record', // 组件导航页
        component: () => import('../page/record.vue') 
    },
      {
          path: '/config', // 数据配置
          component: () => import('../page/config.vue')
      },
  ],
})

export default router