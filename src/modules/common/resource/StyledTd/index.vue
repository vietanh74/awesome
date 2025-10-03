<template>
  <td :class="tdClasses">{{ val ? round(val, 2) : '-' }}</td>
</template>

<script setup lang="ts">
import { round } from 'lodash-es';
import { computed } from 'vue';

interface Props {
  val: number;
}

const props = defineProps<Props>();

const tdClasses = computed<string>(() => {
  if (!props.val) {
    return '';
  }

  if (props.val >= 10) {
    return 'bg-red-600 text-white';
  }

  if (props.val < 5) {
    return 'bg-green-500 text-white';
  }

  return '';
});
</script>
