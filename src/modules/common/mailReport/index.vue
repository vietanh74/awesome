<template>
  <div>
    <div v-if="screenState.isLoading" class="p-4 h-56 flex justify-center items-center">
      <Spin />
    </div>

    <div v-else>
      <div>1. Công việc đã hoàn thành:</div>
      <div v-for="(item, index) in doneTasks" :key="index">
        {{ item.key }}&nbsp;&nbsp;&nbsp;{{ item.summary }}
        <span v-if="route.query.hasStatus" class="text-green-700">- &nbsp;&nbsp;&nbsp;{{ item.status }}</span>
      </div>
      <br />

      <div>2. Công việc đang thực hiện:</div>
      <div v-for="(item, index) in inProgressTasks" :key="index">
        {{ item.key }}&nbsp;&nbsp;&nbsp;{{ item.summary }}
        <span v-if="route.query.hasStatus" class="text-green-700">- &nbsp;&nbsp;&nbsp;{{ item.status }}</span>
      </div>
      <br />

      <div>* Vấn đề tồn đọng:</div>
      <div>N/A</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Spin } from 'ant-design-vue';
import { forEach, get } from 'lodash-es';
import { useRoute } from 'vue-router';

import { jiraService } from '@/services';

const route = useRoute();
const doneTasks = ref<any[]>([]);
const inProgressTasks = ref<any[]>([]);
const screenState = reactive({
  isLoading: false,
});

onMounted(() => {
  getIssues();
});

async function getIssues() {
  const jql =
    'labels = FE-Team AND Sprint in (3515) AND issuetype not in (Bug, Sub-task, "Bug UAT") ORDER BY "Finish date (WBSGantt)" ASC, updated DESC';

  screenState.isLoading = true;
  const { data } = await jiraService
    .searchIssues({
      jql,
      maxResults: 50,
    })
    .finally(() => (screenState.isLoading = false));

  const issues: any[] = data.issues;
  console.log('issues', issues);
  const convertedDoneTasks: any[] = [];
  const convertedInProgressTasks: any[] = [];

  forEach(issues, (item) => {
    const taskStatus = get(item, 'fields.status.name');

    if (['Ready Onproduction', 'On-Production', 'Closed'].includes(taskStatus)) {
      convertedDoneTasks.push(getFields(item));
      return;
    }

    convertedInProgressTasks.push(getFields(item));
  });

  doneTasks.value = convertedDoneTasks;
  inProgressTasks.value = convertedInProgressTasks;
}

function getFields(task) {
  return {
    summary: task.fields.summary,
    key: task.key,
    status: get(task, 'fields.status.name'),
  };
}
</script>

<style scoped lang="scss" src="./styles.scss"></style>
