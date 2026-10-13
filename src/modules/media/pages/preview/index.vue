<template>
  <div>
    <div v-if="screenState.fetching" class="h-screen flex items-center justify-center">
      <Spin />
    </div>

    <div v-else class="py-4 px-1">
      <div class="flex gap-1 items-start">
        <div
          v-for="(colItems, colIndex) in galleryMediaFiles"
          :key="colIndex"
          class="flex flex-col gap-1 flex-1 min-w-0"
        >
          <div
            v-for="(item, index) in colItems"
            :key="item.id || index"
            class="group bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden w-full m-0 flex flex-col"
          >
            <div
              class="px-3 py-2.5 flex items-start justify-between gap-3 bg-slate-50/50 border-b border-slate-100"
            >
              <div class="text-slate-700 text-xs wrap-break-word leading-tight flex-1 min-w-0">
                {{ item.name }}
              </div>
              <Dropdown :trigger="['click']" placement="bottomRight">
                <div
                  class="flex items-center justify-center size-4 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 cursor-pointer transition-colors shrink-0"
                  title="Actions"
                  @click.prevent
                >
                  <MoreOutlined />
                </div>

                <template #overlay>
                  <Menu>
                    <MenuItem key="copy" @click="copyName(item)">
                      <CopyOutlined class="mr-2" />
                      Copy Name
                    </MenuItem>
                    <MenuItem key="upload" @click="goToUpload(item)">
                      <SendOutlined class="mr-2" />
                      Go to Upload
                    </MenuItem>
                    <MenuItem key="delete" danger @click="confirmDelete(item)">
                      <DeleteOutlined class="mr-2" />
                      Xóa
                    </MenuItem>
                  </Menu>
                </template>
              </Dropdown>
            </div>

            <div class="relative bg-slate-100">
              <div
                v-if="!isMediaItemStarted(item)"
                class="cursor-pointer relative block"
                @click="startVideo(item)"
              >
                <ImageOrDefault
                  :src="item.previewImage"
                  class="w-full h-auto block object-cover"
                  loading="lazy"
                >
                  <img
                    src="/defaultPreview.jpg"
                    class="w-full h-auto min-h-20 block object-cover"
                    loading="lazy"
                  />
                </ImageOrDefault>
                <div
                  class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none"
                >
                  <div
                    class="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-800 scale-90 group-hover:scale-100 transition-transform"
                  >
                    <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <video v-else class="w-full block bg-black" controls autoplay>
                <source :src="item.url" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center min-h-16 py-4">
        <div v-if="isLoadingMore" class="flex items-center gap-2 text-xs text-[#64748b]">
          <Spin size="small" />
          Đang tải thêm...
        </div>

        <button
          v-else-if="screenState.loadMoreFailed"
          type="button"
          class="px-3 py-1.5 rounded-full border border-[#e2e8f0] bg-[#ffffff] text-xs text-[#475569] shadow-sm hover:border-[#cbd5e1] hover:text-[#0f172a] transition-colors cursor-pointer"
          @click="retryLoadMore"
        >
          Tải thất bại · Thử lại
        </button>

        <div
          v-else-if="!screenState.nextPageToken && !isEmpty(mediaFiles)"
          class="flex items-center gap-3 text-xs text-[#94a3b8]"
        >
          <span class="h-px w-10 bg-[#e2e8f0]" />
          Đã hiển thị toàn bộ {{ size(mediaFiles) }} video
          <span class="h-px w-10 bg-[#e2e8f0]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Spin, message, Modal, Dropdown, Menu } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { isEmpty, map, size } from 'lodash-es';
import { CopyOutlined, SendOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons-vue';
import { useClipboard, useInfiniteScroll } from '@vueuse/core';

import { commonService } from '@/services';
import { RouteName } from '@/shared/constants';
import { ImageOrDefault } from '@/components';

const MenuItem = Menu.Item;
const PAGE_SIZE = 30;

const router = useRouter();
const screenState = reactive({
  fetching: false,
  loadMoreFailed: false,
  nextPageToken: null as string | null,
});
const mediaFiles = ref<any[]>([]);
const { copy } = useClipboard();

// Chỉ load thêm khi còn trang sau và lần trước không lỗi (tránh gọi lặp)
const { isLoading: isLoadingMore } = useInfiniteScroll(window, loadMore, {
  distance: 400,
  canLoadMore: () => !screenState.fetching && !!screenState.nextPageToken && !screenState.loadMoreFailed,
});

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

  const { error, data } = await commonService
    .getFiles({ maxResults: PAGE_SIZE })
    .finally(() => (screenState.fetching = false));

  if (error) {
    return;
  }

  mediaFiles.value = normalizeMediaFiles(data.items);
  screenState.nextPageToken = data.nextPageToken;
}

async function loadMore() {
  const { error, data } = await commonService.getFiles({
    pageToken: screenState.nextPageToken as string,
    maxResults: PAGE_SIZE,
  });

  if (error) {
    screenState.loadMoreFailed = true;
    return;
  }

  mediaFiles.value = [...mediaFiles.value, ...normalizeMediaFiles(data.items)];
  screenState.nextPageToken = data.nextPageToken;
}

function retryLoadMore() {
  // canLoadMore đổi → useInfiniteScroll tự kiểm tra và gọi lại loadMore
  screenState.loadMoreFailed = false;
}

function normalizeMediaFiles(items) {
  return map(items, (item) => ({
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

function confirmDelete(mediaItem) {
  Modal.confirm({
    title: 'Xóa file này?',
    content: mediaItem.name,
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: async () => {
      const { error, message: msg } = await commonService.deleteMedia({ fileId: mediaItem.id });

      if (error) {
        return;
      }

      mediaFiles.value = mediaFiles.value.filter((item) => item.id !== mediaItem.id);
      message.success(msg);
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function goDetail(mediaFile) {
  router.push({ name: RouteName.PREVIEW_DETAIL, params: { fileId: mediaFile.id } });
}
</script>
