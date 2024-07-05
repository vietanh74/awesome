<template>
  <div class="p-5">
    <div class="w-full md:w-1/2">
      <Input v-model:value="formState.username" placeholder="Tài khoản" @keyup.enter="submit()" />
    </div>

    <div class="w-full md:w-1/2 mt-5">
      <InputPassword v-model:value="formState.password" placeholder="Mật khẩu" @keyup.enter="submit()" />
    </div>

    <div class="mt-5">
      <Button type="primary" :loading="screenState.loading" @click="submit()">Submit</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { cloneDeep } from 'lodash-es';
import { Input, Button, InputPassword } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';

import { commonService } from '@/services';
import { RouteName } from '@/shared/constants';
import { setAppToken } from '@/core';

interface FormState {
  username: string;
  password: string;
}

const router = useRouter();
const route = useRoute();
const formState = ref<FormState>({
  username: '',
  password: '',
});
const screenState = reactive({
  loading: false,
});

async function submit() {
  screenState.loading = true;
  const clonedFormState = cloneDeep(formState.value);

  const { error, data } = await commonService
    .login(clonedFormState)
    .finally(() => (screenState.loading = false));

  if (error) {
    return;
  }

  setAppToken(data);
  const returnUrl = route.query?.returnUrl as string;

  if (!returnUrl) {
    router.push({ name: RouteName.HOMEPAGE });
    return;
  }

  router.push(decodeURIComponent(returnUrl));
}
</script>
