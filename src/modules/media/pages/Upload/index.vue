<template>
  <div class="p-4">
    <div class="flex gap-5">
      <div class="cursor-pointer" @click="uploadFile()">Hello</div>
      <div>{{ formState.file.name }}</div>
    </div>
    <input ref="fileInputRef" class="hidden" type="file" @change="(e) => onSelectMedia(e)" />

    <div class="mt-4">
      <Button type="primary" :loading="screenState.uploading" @click="submit()">Submit</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { message, Button } from 'ant-design-vue';
import { reactive, ref } from 'vue';

import { commonService } from '@/services';

const fileInputRef = ref();
const screenState = reactive({
  uploading: false,
});
const formState = ref<{
  file?: any;
}>({
  file: {},
});

function uploadFile() {
  fileInputRef.value.click();
}

async function onSelectMedia(e) {
  const files = e.target.files;
  formState.value.file = files[0];
  fileInputRef.value.value = null;
}

async function submit() {
  const formData = new FormData();
  formData.append('file', formState.value.file);

  screenState.uploading = true;

  const { error, message: msg } = await commonService
    .uploadFile(formData)
    .finally(() => (screenState.uploading = false));

  if (error) {
    return;
  }

  message.success(msg);
}
</script>
