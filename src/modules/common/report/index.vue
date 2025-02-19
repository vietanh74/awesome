<template>
  <div>
    <div v-if="screenState.isLoading" class="p-4 h-56 flex justify-center items-center">
      <Spin />
    </div>

    <div v-else>
      <table>
        <tr v-for="(item, index) in reportDatas" :key="index">
          <td>{{ item.username }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.totalEstimateHour }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { forOwn, get, mapValues, reduce } from 'lodash-es';
import { onMounted, reactive, ref } from 'vue';
import { Spin } from 'ant-design-vue';

import { jiraService } from '@/services';

const reportDatas = ref<any[]>([]);
const screenState = reactive({
  isLoading: false,
});

onMounted(() => {
  getIssues();
});

async function getIssues() {
  const assignee = 'gamdth1,huongcm,anhhd55,thanhdh25,thanhtt151,anhhv71,truonghd10';
  const jql = `("Start date (WBSGantt)" >= startOfWeek(1d) AND due <= endOfWeek(1d) OR "Start date (WBSGantt)" is EMPTY OR due is EMPTY) AND project = "Customer Services" AND issueFunction not in hasSubtasks() AND status not in (Cancelled, Pending) AND Sprint in openSprints() AND Sprint in openSprints() AND assignee in (${assignee})`;

  screenState.isLoading = true;
  const { data } = await jiraService
    .searchIssues({
      jql,
      maxResults: 100,
    })
    .finally(() => (screenState.isLoading = false));

  const issues: any[] = data.issues;
  console.log('data', data);

  let convertedValues: any[] = [];

  const assigneeIssues = reduce(
    issues,
    (val, item) => {
      const assigneeKey = item.fields.assignee.name;

      if (!val[assigneeKey]) {
        val[assigneeKey] = {
          items: [item],
          username: get(item, 'fields.assignee.displayName'),
          userKey: assigneeKey,
        };
        return val;
      }

      val[assigneeKey].items.push(item);
      return val;
    },
    {}
  );

  forOwn(assigneeIssues, (value: any) => {
    convertedValues = convertedValues.concat(mapDataToTableContent(value));
  });

  console.log('convertedValues', convertedValues);

  reportDatas.value = convertedValues;
}

function mapDataToTableContent(assigneeIssue) {
  return convertToReports(assigneeIssue.items).map((item, index) => {
    return {
      ...item,
      username: index === 0 ? assigneeIssue.username : '',
    };
  });
}

function convertToReports(subTasks: any[]) {
  const returnValues: any[] = [];

  const groupedIssues = reduce(
    subTasks,
    (val, item) => {
      const parentKey = get(item, 'fields.parent.key');

      if (!parentKey) {
        return val;
      }

      if (!val[parentKey]) {
        if (get(item, 'fields.parent.fields.issuetype.name') === 'Bug') {
          //
        }

        val[parentKey] = {
          totalEstimate: timeToHour(item.fields.timeestimate),
          name: get(item, 'fields.parent.fields.summary'),
          key: parentKey,
        };
        return val;
      }

      val[parentKey].totalEstimate += timeToHour(item.fields.timeestimate);
      return val;
    },
    {}
  );

  mapValues(groupedIssues, (val: any) => {
    returnValues.push({
      ...val,
      totalEstimateHour: `${val.totalEstimate}h`,
    });
  });

  return returnValues;
}

function timeToHour(val: number) {
  if (!val) {
    return 0;
  }

  return val / 60 / 60;
}
</script>

<style scoped lang="scss" src="./styles.scss"></style>
