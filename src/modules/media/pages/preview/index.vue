<template>
  <div class="p-4">
    <div v-if="screenState.fetching" class="h-12 flex items-center justify-center">
      <Spin />
    </div>

    <div v-else>
      <Row :gutter="[16, 16]">
        <Col
          v-for="(galleryItem, galleryIndex) in galleryMediaFiles"
          :key="galleryIndex"
          :span="24 / colSize"
        >
          <!-- :lg="{ span: 6 }"
          :md="{ span: 8 }"
          :xs="{ span: 12 }" -->
          <!-- @click="goDetail(item)" -->
          <div
            v-for="(item, index) in galleryItem"
            :key="index"
            class="p-1 mb-4 border border-solid border-violet-200 rounded overflow-hidden"
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

            <div v-if="!item.isStarted" class="cursor-pointer" @click="startVideo(item)">
              <ImageOrDefault :src="item.previewImage" class="w-full h-auto" loading="lazy">
                <img
                  src="/defaultPreview.jpg"
                  class="w-full h-auto min-h-14"
                  loading="lazy"
                  @click="startVideo(item)"
                />
              </ImageOrDefault>
            </div>

            <!-- preload="none" -->
            <video v-else class="w-full" controls>
              <source :src="item.url" type="video/mp4" />
            </video>
          </div>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Spin, Col, Row, message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { cloneDeep, map, size, take, takeRight } from 'lodash-es';
import { CopyOutlined, SendOutlined } from '@ant-design/icons-vue';
import { useClipboard, breakpointsTailwind, useBreakpoints } from '@vueuse/core';

import { commonService } from '@/services';
import { RouteName } from '@/shared/constants';
import { ImageOrDefault } from '@/components';

type ColSize = 2 | 3 | 4;

const router = useRouter();
const screenState = reactive({
  fetching: false,
});
const mediaFiles = ref<any[]>([]);
const { copy } = useClipboard();
const breakpoints = useBreakpoints(breakpointsTailwind);

const colSize = computed<ColSize>(() => {
  if (breakpoints.lg.value) {
    return 4;
  }

  if (breakpoints.md.value) {
    return 3;
  }

  return 2;
});

const galleryMediaFiles = computed(() => {
  const results: any[] = [];
  let clonedMediaFiles = cloneDeep(mediaFiles.value);
  const mediaFilesCount = size(mediaFiles.value);

  if (mediaFilesCount === 0) {
    return [];
  }

  const perColItemSize = Math.trunc(mediaFilesCount / colSize.value);

  for (let i = 1; i <= colSize.value; i++) {
    if (i === colSize.value) {
      const items = clonedMediaFiles;
      results.push(items);
      continue;
    }

    const tempMediaClount = size(clonedMediaFiles);
    const items = take(clonedMediaFiles, perColItemSize);
    results.push(items);
    clonedMediaFiles = takeRight(clonedMediaFiles, tempMediaClount - perColItemSize);
  }

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

  data.splice(0, 1);

  mediaFiles.value = map(data, (item) => ({
    ...item,
    name: item.name.replace('tests/', '').replace('.mp4', ''),
  }));
}

function startVideo(mediaItem) {
  mediaItem.isStarted = true;
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
