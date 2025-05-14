<template>
  <n-config-provider :theme="themeColor" :locale="zhCN" :date-locale="dateZhCN">
    <router-view></router-view>
  </n-config-provider>
</template>
<script setup lang="ts">
  import { NConfigProvider, NInput, NDatePicker, NSpace } from 'naive-ui'
  import { zhCN, dateZhCN } from 'naive-ui'

  const themeColor = {
  blue: '#1677ff',
  green: '#238580',
  dark: '#33354A'
}


</script>
<style scoped>
</style>