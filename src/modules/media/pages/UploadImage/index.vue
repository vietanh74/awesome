<template>
  <div class="p-4">
    <div class="flex gap-5 mb-2">
      <div class="cursor-pointer" @click="uploadFile()">Chọn file</div>
      <div>{{ formState.file.name }}</div>
    </div>

    <div class="flex gap-5 items-center">
      <div>File name</div>
      <div class="grow">
        <Input v-model:value="formState.fileName" />
      </div>
    </div>

    <input ref="fileInputRef" class="hidden" type="file" @change="(e) => onSelectMedia(e)" />

    <div class="mt-4">
      <Button type="primary" :loading="screenState.uploading" @click="submit()">Submit</Button>
    </div>
  </div>

  <Divider class="my-3" />

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
          <div class="p-1 border border-solid border-violet-200 rounded overflow-hidden">
            <div class="mb-2 flex gap-4">
              <Popconfirm title="Xóa nó?" ok-text="OK" cancel-text="Noooooo" @confirm="confirmDelete(item)">
                <div class="cursor-pointer">
                  <DeleteOutlined />
                </div>
              </Popconfirm>
            </div>

            <div class="mb-1 inline-flex items-center">
              <div v-if="!item.startRename">{{ item.name }}</div>
              <div v-else>
                <Input v-model:value="item.draftNewName" @keyup.enter="processRename(item)"></Input>
              </div>

              <div
                v-if="!item.startRename"
                class="ml-3 cursor-pointer select-none"
                @click="actionRename(item)"
              >
                <EditOutlined />
              </div>
              <div v-else class="ml-3 cursor-pointer select-none" @click="cancelActionRename(item)">
                <CloseCircleOutlined />
              </div>
            </div>

            <div class="cursor-pointer">
              <ImageOrDefault :src="item.url" class="w-full h-auto" loading="lazy">
                <img src="/defaultPreview.jpg" class="w-full h-auto min-h-14" loading="lazy" />
              </ImageOrDefault>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { message, Button, Input, Divider, Row, Col, Spin, Popconfirm } from 'ant-design-vue';
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { map } from 'lodash-es';
import { DeleteOutlined, EditOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';

import { commonService } from '@/services';
import { ImageOrDefault } from '@/components';

const route = useRoute();
const fileInputRef = ref();
const screenState = reactive({
  uploading: false,
  fetching: false,
});
const mediaFiles = ref<any[]>([]);
const formState = ref<{
  file?: any;
  fileName: string;
}>({
  file: {},
  fileName: '',
});

onMounted(() => {
  if (route.query.fileName) {
    formState.value.fileName = (route.query.fileName as string) || '';
  }

  getPreviewList();
});

async function getPreviewList() {
  screenState.fetching = true;

  const { error, data } = await commonService
    .getPreviewImages()
    .finally(() => (screenState.fetching = false));

  if (error) {
    return;
  }

  data.splice(0, 1);

  mediaFiles.value = map(data, (item) => ({
    ...item,
    name: item.name.replace('previewImages/', '').replace('.png', ''),
  }));
}

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
  formData.append('fileName', formState.value.fileName);

  screenState.uploading = true;

  const { error, message: msg } = await commonService
    .uploadPreviewImage(formData)
    .finally(() => (screenState.uploading = false));

  if (error) {
    return;
  }

  getPreviewList();
  message.success(msg);
}

async function confirmDelete(mediaItem) {
  const { error, message: msg } = await commonService.deletePreview({ fileId: mediaItem.id });

  if (error) {
    return;
  }

  getPreviewList();
  message.success(msg);
}

async function actionRename(mediaItem) {
  mediaItem.startRename = true;
  mediaItem.draftNewName = mediaItem.name;
}

async function cancelActionRename(mediaItem) {
  mediaItem.startRename = false;
}

async function processRename(mediaItem) {
  const { error, message: msg } = await commonService.renamePreview({
    fileId: mediaItem.id,
    oldName: mediaItem.name,
    newName: mediaItem.draftNewName,
  });

  if (error) {
    return;
  }

  mediaItem.name = mediaItem.draftNewName;
  cancelActionRename(mediaItem);
  message.success(msg);
}
</script>
