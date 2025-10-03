<template>
  <div class="p-5">
    <div v-if="screenState.isLoading" class="p-4 h-56 flex justify-center items-center">
      <Spin />
    </div>

    <div v-else>
      <table>
        <thead>
          <tr>
            <th></th>
            <th v-for="(item, index) in sprintDays" :key="index">{{ item.title }}</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(reportData, index) in reportDatas" :key="index">
            <td>{{ reportData.username }}</td>
            <StyledTd
              v-for="(sprintDay, sprintDayIndex) in sprintDays"
              :key="sprintDayIndex"
              :val="reportData[sprintDay.key]"
            />
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { forEach, get, reduce, round, sortBy } from 'lodash-es';
import { onMounted, reactive, ref } from 'vue';
import { Spin } from 'ant-design-vue';
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  getWeek,
  isSaturday,
  isSunday,
  isWithinInterval,
  parseISO,
  startOfWeek,
  subWeeks,
} from 'date-fns';

import { jiraService } from '@/services';
import StyledTd from './StyledTd/index.vue';

interface SprintDay {
  key: string;
  title: string;
  isDayOff: boolean;
}

interface AssigneeIssue {
  userKey: string;
  username: string;
  items: any[];
}

const reportDatas = ref<Record<string, any>[]>([]);
const sprintDays = ref<SprintDay[]>([]);
// const currentDate = parseISO('2025-01-01');
const currentDate = new Date();
const screenState = reactive({
  isLoading: false,
});

onMounted(() => {
  getIssues();
});

async function getIssues() {
  const assignee = 'huongcm,anhhd55,thanhdh25,anhhv71,truonghd10,anhtv56';
  const jql = `("Start date (WBSGantt)" >= startOfWeek(1d) AND due <= endOfWeek(1d) OR "Start date (WBSGantt)" is EMPTY OR due is EMPTY) AND "Start date (WBSGantt)" >= startOfWeek(1d) AND due <= endOfWeek(1d) AND issueFunction not in hasSubtasks() AND status not in (Cancelled, Pending) AND assignee in (${assignee})`;

  screenState.isLoading = true;
  const { data } = await jiraService
    .searchIssues({
      jql,
      maxResults: 200,
      // maxResults: 20,
    })
    .finally(() => (screenState.isLoading = false));

  const issues: any[] = data.issues;

  let convertedValues: any[] = [];
  sprintDays.value = getAllDaysOfSprint();

  const reduceAssigneeIssues: Record<string, AssigneeIssue> = reduce(
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
    {},
  );

  const assigneeIssues = sortBy(Object.values(reduceAssigneeIssues), (item) => {
    if (item.userKey === 'anhtv56') {
      return 0;
    }

    return 1;
  });

  forEach(assigneeIssues, (item) => {
    convertedValues = convertedValues.concat(mapDataToTableContent(item));
  });

  reportDatas.value = convertedValues;
}

function getAllDaysOfSprint(): SprintDay[] {
  let startDay: Date, endDay: Date;
  const numberOfWeekYear = getWeek(currentDate);

  if (isOdd(numberOfWeekYear)) {
    startDay = startOfWeek(currentDate, { weekStartsOn: 1 });
    endDay = endOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 });
  } else {
    startDay = startOfWeek(subWeeks(currentDate, 1), { weekStartsOn: 1 });
    endDay = endOfWeek(currentDate, { weekStartsOn: 1 });
  }

  const days = eachDayOfInterval({
    start: startDay,
    end: endDay,
  });

  return days.map((item) => {
    return {
      key: formatDateToKey(item),
      title: format(item, 'dd/MM'),
      isDayOff: isDayOff(item),
    };
  });
}

function isOdd(n: number) {
  return Math.abs(n % 2) === 1;
}

function formatDateToKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function isDayOff(date: Date): boolean {
  if (isSunday(date)) {
    return true;
  }

  if (!isSaturday(date)) {
    return false;
  }

  const countWeek = getWeek(date);

  if (isOdd(countWeek)) {
    return true;
  }

  return false;
}

function mapDataToTableContent(assigneeIssue: AssigneeIssue): Record<string, any> {
  const returnValue: Record<string, any> = {
    username: assigneeIssue.username,
  };
  const startDateField = 'customfield_10600';

  for (const sprintDay of sprintDays.value) {
    const totalHourInDay = assigneeIssue.items.reduce((val, item) => {
      const startDate = get(item, `fields.${startDateField}`);
      const dueDate = get(item, 'fields.duedate');

      if (!startDate || !dueDate) {
        return val;
      }

      const isoStartDate = parseISO(startDate);
      const isoDueDate = parseISO(dueDate);

      if (startDate === dueDate) {
        if (startDate !== sprintDay.key) {
          return val;
        }

        return val + getTotalTime(item);
      }

      const isWithin = isWithinInterval(parseISO(sprintDay.key), { start: isoStartDate, end: isoDueDate });

      if (!isWithin) {
        return val;
      }

      const days = eachDayOfInterval({
        start: isoStartDate,
        end: isoDueDate,
      });

      const totalHourPerDay = round(getTotalTime(item) / days.length, 2);

      if (days.length > 9) {
        console.log('Sai start và end date: ', item);
      }

      return val + totalHourPerDay;
    }, 0);

    returnValue[sprintDay.key] = totalHourInDay;
  }

  return returnValue;
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
