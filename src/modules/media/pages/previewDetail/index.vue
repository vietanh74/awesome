<template>
  <div class="p-4">
    <div class="cursor-pointer" @click="back()">Back</div>

    <div class="mt-4">
      <div v-if="screenState.fetching" class="h-12 flex items-center justify-center">
        <Spin />
      </div>

      <div v-else>
        <div class="mb-3">{{ mediaFile.name }}</div>
        <video class="w-full lg:w-60" controls>
          <source :src="mediaFile.url" type="video/mp4" />
        </video>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Spin } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';

import { commonService } from '@/services';

const router = useRouter();
const route = useRoute();
const screenState = reactive({
  fetching: false,
});
const mediaFile = ref<any>({});

const fileId = computed(() => decodeURIComponent(route.params.fileId as string));

onMounted(() => {
  getDetail();
});

async function getDetail() {
  screenState.fetching = true;

  const { error, data } = await commonService
    .fileDetail(fileId.value)
    .finally(() => (screenState.fetching = false));

  if (error) {
    return;
  }

  mediaFile.value = data;
}

function back() {
  router.back();
}
</script>
