<template>
  <div class="p-4">
    <div class="flex gap-5">
      <div class="cursor-pointer" @click="uploadFile()">Hello</div>
      <div>{{ formState.file.name }}</div>
    </div>
    <input ref="fileInputRef" class="hidden" type="file" @change="(e) => onSelectMedia(e)" />

    <div v-if="screenState.uploading" class="mt-4 w-full max-w-md">
      <div class="mb-1 flex justify-between text-sm text-gray-600">
        <span>Uploading...</span>
        <span>{{ screenState.progress }}%</span>
      </div>
      <div class="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          class="h-full rounded-full bg-blue-500 transition-all duration-300"
          :style="{ width: `${screenState.progress}%` }"
        />
      </div>
    </div>

    <div class="mt-4">
      <Button type="primary" :loading="screenState.uploading" @click="submit()">Submit</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { message, Button } from 'ant-design-vue';
import { nanoid } from 'nanoid';
import { reactive, ref, onBeforeUnmount } from 'vue';

import { commonService } from '@/services';

const fileInputRef = ref();
let streamInstance: ReturnType<typeof commonService.getStreamProgress> | null = null;

const screenState = reactive({
  uploading: false,
  progress: 0,
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

function closeStream() {
  if (!streamInstance) return;

  streamInstance.close();
  streamInstance = null;
}

function listenProgress(hashid: string) {
  streamInstance = commonService.getStreamProgress(hashid, (data) => {
    if (data.status === 'UPLOADING' && data.total > 0) {
      screenState.progress = Math.round((data.loaded / data.total) * 100);
      return;
    }

    if (data.status === 'DONE') {
      screenState.progress = 100;
      screenState.uploading = false;
      closeStream();
    }
  });
}

async function submit() {
  if (!formState.value.file?.name) {
    message.warning('Please select a file first');
    return;
  }

  const hashid = nanoid();
  const formData = new FormData();
  formData.append('file', formState.value.file);

  screenState.uploading = true;
  screenState.progress = 0;

  listenProgress(hashid);

  const { error } = await commonService.uploadStreamFile(hashid, formData);

  screenState.uploading = false;

  if (error) {
    closeStream();
    return;
  }

  message.success('Upload completed!');
}

onBeforeUnmount(() => {
  closeStream();
});
</script>
