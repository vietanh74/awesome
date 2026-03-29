<template>
  <div class="p-4">
    <div v-if="screenState.fetching" class="h-12 flex items-center justify-center">
      <Spin />
    </div>

    <div v-else>
      <div class="flex gap-4 items-start">
        <div
          v-for="(colItems, colIndex) in galleryMediaFiles"
          :key="colIndex"
          class="flex flex-col gap-4 flex-1 min-w-0"
        >
          <div
            v-for="(item, index) in colItems"
            :key="item.id || index"
            class="p-1 border border-solid border-violet-200 rounded overflow-hidden w-full m-0"
          >
            <div class="mb-1 inline-flex break-all">
              <div>{{ item.name }}</div>
              <div class="ml-3 cursor-pointer select-none" @click="copyName(item)">
                <CopyOutlined />
              </div>

              <div class="ml-3 cursor-pointer select-none" @click="goToUpload(item)">
                <SendOutlined />
              </div>
            </div>

            <div v-if="!isMediaItemStarted(item)" class="cursor-pointer" @click="startVideo(item)">
              <ImageOrDefault :src="item.previewImage" class="w-full h-auto" loading="lazy">
                <img
                  src="/defaultPreview.jpg"
                  class="w-full h-auto min-h-14"
                  loading="lazy"
                  @click="startVideo(item)"
                />
              </ImageOrDefault>
            </div>

            <video v-else class="w-full" controls>
              <source :src="item.url" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Spin, message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { map } from 'lodash-es';
import { CopyOutlined, SendOutlined } from '@ant-design/icons-vue';
import { useClipboard } from '@vueuse/core';

import { commonService } from '@/services';
import { RouteName } from '@/shared/constants';
import { ImageOrDefault } from '@/components';

const router = useRouter();
const screenState = reactive({
  fetching: false,
});
const mediaFiles = ref<any[]>([]);
const { copy } = useClipboard();

const colSize = ref<number>(2);

const galleryMediaFiles = computed(() => {
  const count = Math.max(1, colSize.value || 1);
  const results: any[][] = Array.from({ length: count }, () => []);

  mediaFiles.value.forEach((item, index) => {
    results[index % count].push(item);
  });

  return results;
});

onMounted(() => {
  getList();
});

async function getList() {
  screenState.fetching = true;

  const { error, data } = await commonService.getFiles().finally(() => (screenState.fetching = false));

  if (error) {
    return;
  }

  mediaFiles.value = map(data, (item) => ({
    ...item,
    name: item.name.replace('tests/', '').replace('.mp4', ''),
  }));
}

function isMediaItemStarted(mediaItem) {
  const findedMediaItem = mediaFiles.value.find((item) => item.id === mediaItem.id);

  if (!findedMediaItem) {
    return false;
  }

  return findedMediaItem.isStarted;
}

function startVideo(mediaItem) {
  const findedMediaItem = mediaFiles.value.find((item) => item.id === mediaItem.id);

  if (!findedMediaItem) {
    return false;
  }

  findedMediaItem.isStarted = true;
}

async function copyName(mediaItem) {
  await copy(mediaItem.name);

  message.success('Copied');
}

async function goToUpload(mediaItem) {
  router.push({ name: RouteName.UPLOAD_IMAGE, query: { fileName: mediaItem.name } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function goDetail(mediaFile) {
  router.push({ name: RouteName.PREVIEW_DETAIL, params: { fileId: mediaFile.id } });
}
</script>
