<template>
  <div>
    <div v-if="screenState.isLoading" class="p-4 h-56 flex justify-center items-center">
      <Spin />
    </div>

    <div v-else>
      <!-- <div>1. Công việc đã hoàn thành:</div>
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
      <div>N/A</div> -->

      <table>
        <tr v-for="(item, index) in reportTasks" :key="index">
          <td>
            {{ item.summary }}
          </td>
          <td>{{ item.note }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { Spin } from 'ant-design-vue';
import { get, includes, map } from 'lodash-es';

import { jiraService } from '@/services';

const reportTasks = ref<any[]>([]);
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
  // const convertedDoneTasks: any[] = [];
  // const convertedInProgressTasks: any[] = [];
  const convertedReportTasks = map(issues, (item) => getFields(item));
  reportTasks.value = convertedReportTasks;

  // forEach(issues, (item) => {
  //   if (isDoneTask(item)) {
  //     convertedDoneTasks.push(getFields(item));
  //     return;
  //   }

  //   convertedInProgressTasks.push(getFields(item));
  // });

  // doneTasks.value = convertedDoneTasks;
  // inProgressTasks.value = convertedInProgressTasks;
}

function getFields(task) {
  return {
    summary: task.fields.summary,
    key: task.key,
    status: get(task, 'fields.status.name'),
    note: getTaskNote(task),
  };
}

function getTaskNote(task) {
  const taskStatus = get(task, 'fields.status.name');

  if (isDoneTask(task)) {
    return 'Ready';
  }

  if (taskStatus === 'UAT') {
    return 'Đã test xong, chờ UAT';
  }

  if (taskStatus === 'In Progress') {
    return 'Đang xử lý';
  }

  if (taskStatus === 'Testing') {
    if (isBeginTest(task)) {
      return 'Đang test';
    }

    return 'Hoàn thành dev, chưa test';
  }
}

function isDoneTask(task) {
  const taskStatus = get(task, 'fields.status.name');

  if (['Ready Onproduction', 'On-Production', 'Closed'].includes(taskStatus)) {
    return true;
  }

  return false;
}

function isBeginTest(task) {
  const subTasks = get(task, 'fields.subtasks');

  for (const item of subTasks) {
    if (!includes(item.fields.summary, '[TEST]')) {
      continue;
    }

    if (get(item, 'fields.status.name') !== 'Todo') {
      return true;
    }
  }

  return false;
}
</script>

<style scoped lang="scss" src="./styles.scss"></style>
