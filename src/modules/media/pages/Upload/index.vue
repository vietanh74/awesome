<template>
  <div class="p-4">
    <div class="flex gap-5">
      <div class="cursor-pointer" @click="uploadFile()">Hello</div>
      <div>{{ formState.file.name }}</div>
    </div>
    <input ref="fileInputRef" class="hidden" type="file" @change="(e) => onSelectMedia(e)" />

    <div v-if="screenState.uploading" class="mt-5 w-full max-w-md">
      <div class="mb-2 flex justify-between text-sm font-medium text-slate-600">
        <span>Uploading...</span>
        <span class="text-blue-600">{{ Math.min(100, Math.round(displayProgress)) }}%</span>
      </div>
      <!-- Progress Bar Track -->
      <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
        <!-- Progress Bar Fill -->
        <div
          class="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm"
          :style="{ width: `${displayProgress}%` }"
        >
          <!-- Optional shiny overlay for premium feel -->
          <div class="h-full w-full bg-white/20" />
        </div>
      </div>
    </div>

    <div class="mt-5">
      <Button type="primary" :loading="screenState.uploading" @click="submit()">Submit</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { message, Button } from 'ant-design-vue';
import { nanoid } from 'nanoid';
import { reactive, ref, onBeforeUnmount } from 'vue';
import { useTransition, TransitionPresets } from '@vueuse/core';

import { commonService } from '@/services';

const fileInputRef = ref();
let streamInstance: ReturnType<typeof commonService.getStreamProgress> | null = null;

const screenState = reactive({
  uploading: false,
});

const targetProgress = ref(0);
const displayProgress = useTransition(targetProgress, {
  duration: 800,
  transition: TransitionPresets.easeOutCubic,
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
      targetProgress.value = Math.round((data.loaded / data.total) * 100);
      return;
    }

    if (data.status === 'DONE') {
      targetProgress.value = 100;
      // Note: We don't immediately set screenState.uploading = false
      // here because our display progress might still be catching up.
      // We will handle resetting UI state after upload finishes.
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
  targetProgress.value = 0;

  listenProgress(hashid);

  const { error } = await commonService.uploadStreamFile(hashid, formData);

  targetProgress.value = 100;

  if (error) {
    screenState.uploading = false;
    closeStream();
    return;
  }

  // Allow animation to complete before hiding the bar (about 800ms)
  setTimeout(() => {
    screenState.uploading = false;
    message.success('Upload completed!');
  }, 800);

  closeStream();
}

onBeforeUnmount(() => {
  closeStream();
});
</script>
