<template>
  <div class="p-4">
    <div v-if="screenState.fetching" class="h-12 flex items-center justify-center">
      <Spin />
    </div>

    <div v-else>
      <Row :gutter="[16, 16]">
        <Col
          v-for="(item, index) in mediaFiles"
          :key="index"
          :lg="{ span: 6 }"
          :md="{ span: 8 }"
          :xs="{ span: 12 }"
        >
          <!-- @click="goDetail(item)" -->
          <div class="p-1 border border-solid border-violet-200 rounded overflow-hidden">
            <div class="truncate mb-1">{{ item.name }}</div>

            <div v-if="!item.isStarted" class="cursor-pointer" @click="startVideo(item)">
              <ImageOrDefault :src="item.previewImage" class="w-full h-auto min-h-36" loading="lazy">
                <img
                  src="/defaultPreview.jpg"
                  class="w-full h-auto min-h-36"
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
import { onMounted, reactive, ref } from 'vue';
import { Spin, Col, Row } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { map } from 'lodash-es';

import { commonService } from '@/services';
import { RouteName } from '@/shared/constants';
import { ImageOrDefault } from '@/components';

const router = useRouter();
const screenState = reactive({
  fetching: false,
});
const mediaFiles = ref<any[]>([]);

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function goDetail(mediaFile) {
  router.push({ name: RouteName.PREVIEW_DETAIL, params: { fileId: mediaFile.id } });
}
</script>
