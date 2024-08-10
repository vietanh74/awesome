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
          <div class="truncate mb-1">{{ item.name }}</div>

          <video class="w-full" controls preload="none">
            <source :src="item.url" type="video/mp4" />
          </video>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Spin, Col, Row } from 'ant-design-vue';
import { useRouter } from 'vue-router';

import { commonService } from '@/services';
import { RouteName } from '@/shared/constants';
import { map } from 'lodash-es';

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

function goDetail(mediaFile) {
  router.push({ name: RouteName.PREVIEW_DETAIL, params: { fileId: mediaFile.id } });
}
</script>
