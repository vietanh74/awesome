<template>
  <div>
    <div v-if="screenState.isLoading" class="p-4 h-56 flex justify-center items-center">
      <Spin />
    </div>

    <div v-else>
      <table>
        <tr v-for="(item, index) in reportDatas" :key="index">
          <td>
            {{ item.username }}
            <span v-if="item.username && route.query.hasTotal" class="text-red-600">
              {{ `- ${item.totalHour}` }}
            </span>
          </td>
          <td :class="{ 'text-red-600': item.type === ReportDataType.DAY_OFF }">{{ item.name }}</td>
          <td :class="{ 'text-red-600': item.type === ReportDataType.DAY_OFF }">{{ item.totalEstimate }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { forOwn, get, mapValues, reduce, round, sortBy, toLower } from 'lodash-es';
import { onMounted, reactive, ref } from 'vue';
import { Spin } from 'ant-design-vue';
import { useRoute } from 'vue-router';

import { jiraService } from '@/services';

enum ReportDataType {
  NORMAL = 'normal',
  DAY_OFF = 'dayOff',
}

const route = useRoute();
const reportDatas = ref<any[]>([]);
const screenState = reactive({
  isLoading: false,
});
const dayOffConfigs = [
  { user: 'thanhtt151', day: '3/3', effort: 7 },
  { user: 'gamdth1', day: '8/3', effort: 7 },
  { user: 'anhhd55', day: '8/3', effort: 7 },
  //
];

onMounted(() => {
  getIssues();
});

async function getIssues() {
  const assignee = 'gamdth1,huongcm,anhhd55,thanhdh25,thanhtt151,anhhv71,truonghd10,anhtv56';
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
          totalHour: getTotalTime(item),
        };
        return val;
      }

      val[assigneeKey].items.push(item);
      val[assigneeKey].totalHour += getTotalTime(item);
      return val;
    },
    {},
  );

  forOwn(assigneeIssues, (value: any, key) => {
    convertedValues = convertedValues.concat(mapDataToTableContent(value, key));
  });

  console.log('convertedValues', convertedValues);

  reportDatas.value = convertedValues;
}

function mapDataToTableContent(assigneeIssue, username: string) {
  const reports = convertToReports(assigneeIssue.items).map((item, index) => {
    return {
      ...item,
      username: index === 0 ? assigneeIssue.username : '',
      userKey: assigneeIssue.userKey,
      totalHour: round(assigneeIssue.totalHour, 2),
    };
  });

  const dayOffReports = mapDayOffByUserToRecords(username);

  return reports.concat(dayOffReports);
}

function convertToReports(subTasks: any[]) {
  const returnValues: any[] = [];

  const groupedIssues = reduce(
    subTasks,
    (val, item) => {
      const isSubTaskSupport = toLower(get(item, 'fields.parent.fields.summary')).includes('support');
      const parentKey = isSubTaskSupport ? 'support' : get(item, 'fields.parent.key');

      if (!parentKey) {
        return val;
      }

      if (!val[parentKey]) {
        if (get(item, 'fields.parent.fields.issuetype.name') === 'Bug') {
          //
        }

        val[parentKey] = {
          type: ReportDataType.NORMAL,
          totalEstimate: getTotalTime(item),
          name: isSubTaskSupport ? 'Task planing, support' : get(item, 'fields.parent.fields.summary'),
          key: parentKey,
        };
        return val;
      }

      val[parentKey].totalEstimate += getTotalTime(item);
      return val;
    },
    {},
  );

  mapValues(groupedIssues, (val: any) => {
    returnValues.push({
      ...val,
      totalEstimateHour: `${val.totalEstimate}h`,
    });
  });

  // Để task support xuống cuối
  const sortedValues = sortBy(returnValues, (item) => {
    if (item.key === 'support') {
      return 1;
    }

    return 0;
  });

  return sortedValues;
}

function mapDayOffByUserToRecords(username: string) {
  return dayOffConfigs
    .filter((item) => item.user === username)
    .map((item) => ({
      type: ReportDataType.DAY_OFF,
      totalEstimate: item.effort,
      totalEstimateHour: `${item.effort}h`,
      name: `Nghỉ ngày ${item.day}`,
      key: null,
    }));
}

function getTotalTime(item) {
  const val = item.fields.timeoriginalestimate;

  if (!val) {
    return 0;
  }

  return round(val / 60 / 60, 2);
}
</script>

<style scoped lang="scss" src="./styles.scss"></style>
