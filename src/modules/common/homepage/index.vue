<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function gotoPage() {
  router.push('/p');
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl" @dblclick="gotoPage()">Hello world</h1>
  </div>
</template>
