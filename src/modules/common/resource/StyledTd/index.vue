<template>
  <td :class="tdClasses">{{ tdVal }}</td>
</template>

<script setup lang="ts">
import { round } from 'lodash-es';
import { computed } from 'vue';
import { NON_SET_TIMELINE_KEY, SprintDay } from '../constants';

interface Props {
  val: number;
  sprintDay: SprintDay;
}

const props = defineProps<Props>();

const tdClasses = computed<string>(() => {
  if (props.sprintDay.isDayOff) {
    return 'bg-gray-300';
  }

  if (props.sprintDay.key === NON_SET_TIMELINE_KEY) {
    return 'bg-gray-200';
  }

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

const tdVal = computed<string | number>(() => {
  if (props.sprintDay.isDayOff) {
    return '';
  }

  if (props.sprintDay.key === NON_SET_TIMELINE_KEY && !props.val) {
    return '';
  }

  return props.val ? round(props.val, 2) : '-';
});
</script>
