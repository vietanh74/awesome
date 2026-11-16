<template>
  <ConfigProvider :theme="ANT_THEME">
    <router-view />
  </ConfigProvider>
</template>

<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue';

import { ANT_THEME } from '@/shared/constants';
</script>
