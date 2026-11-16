<template>
  <div class="flex justify-center p-6">
    <Button type="primary" :loading="loading" @click="reorderFiles()">
      <template #icon><ThunderboltOutlined /></template>
      Sắp xếp lại file
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button, message } from 'ant-design-vue';
import { ThunderboltOutlined } from '@ant-design/icons-vue';
import { ref } from 'vue';

import { commonService } from '@/services';

const loading = ref(false);

async function reorderFiles() {
  loading.value = true;

  const { error, message: msg } = await commonService.reorderFiles().finally(() => (loading.value = false));

  if (error) return;

  message.success(msg || 'Thành công');
}
</script>
