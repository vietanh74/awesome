<template>
  <div class="p-4">
    <div v-if="screenState.fetching" class="h-12 flex items-center justify-center">
      <Spin />
    </div>

    <div v-else>
      <Row :gutter="[16, 16]">
        <Col v-for="(item, index) in mediaFiles" :key="index" :md="24" :lg="8">
          <div class="cursor-pointer" @click="goDetail(item)">{{ item.name }}</div>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Spin, Row, Col } from 'ant-design-vue';
import { useRouter } from 'vue-router';

import { commonService } from '@/services';
import { RouteName } from '@/shared/constants';

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

  mediaFiles.value = data;
}

function goDetail(mediaFile) {
  router.push({ name: RouteName.PREVIEW_DETAIL, params: { fileId: mediaFile.id } });
}
</script>
