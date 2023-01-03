<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { size, toString, last } from 'lodash-es';
import {
  startOfMonth,
  endOfMonth,
  parseISO,
  format,
  differenceInDays,
  addDays,
  getYear,
  getDate,
  isSunday,
  getWeek,
  isSaturday,
  getDay,
} from 'date-fns';
import { CalendarVietnamese } from 'date-chinese';

const SETUP_VAR = {
  tinhChoThang: 12,
  tinhChoNam: 2022,
  ngayNghiFull: '1 2 13 21 23 26 27 28 29 30 31'.split(' '),
  ngayDiLamDacBiet: {}, // { 13: 4 } ~ { [Ngày]: [Làm bao nhiêu giờ] }
  configNgayNghiHoacDiLam: {
    BA: 3,
    SAU: 3,
    BAY: 3,
  },
};

const state = reactive<any>({
  ...SETUP_VAR,
  soGioCong: 0,
  thanhTien: 0,
  ngayDacBietDinhKy: [],
});

const THU = {
  1: 'HAI',
  2: 'BA',
  3: 'TU',
  4: 'NAM',
  5: 'SAU',
  6: 'BAY',
  0: 'CN',
};

const HOURS_OF_DAY = 4;

onMounted(() => {
  let soGioCong = 0;
  const targetDate = `${state.tinhChoNam}-${parseMonth(state.tinhChoThang)}-01`;
  const ISOTargetDate = parseISO(targetDate);
  const listDays: any = [];

  const startDate = startOfMonth(ISOTargetDate);
  const endDate = endOfMonth(ISOTargetDate);

  do {
    if (size(listDays)) {
      listDays.push(addDays(last(listDays) as any, 1));
      continue;
    }

    listDays.push(startDate);
  } while (differenceInDays(endDate, last(listDays) as any) > 0);

  for (const item of listDays) {
    const dayNumber = format(item, 'd');
    const dayInWeek = getDay(item);
    const stringDayInWeek = THU[dayInWeek];

    if (state.ngayNghiFull.includes(dayNumber)) {
      continue;
    }

    if (state.ngayDiLamDacBiet[dayNumber]) {
      soGioCong += state.ngayDiLamDacBiet[dayNumber];
      continue;
    }

    if (isVacationDay(item)) {
      continue;
    }

    if (state.configNgayNghiHoacDiLam[stringDayInWeek]) {
      soGioCong += state.configNgayNghiHoacDiLam[stringDayInWeek];
      state.ngayDacBietDinhKy.push({
        ngay: `${dayNumber}`,
        soGio: state.configNgayNghiHoacDiLam[stringDayInWeek],
      });
      continue;
    }

    soGioCong += HOURS_OF_DAY;
  }

  state.soGioCong = soGioCong;
  state.thanhTien = state.soGioCong * 20000;
});

function parseMonth(thang: number) {
  if (size(toString(thang)) === 1) {
    return `0${thang}`;
  }

  return thang;
}

function isVacationDay(targetDate) {
  const countWeek = getWeek(targetDate);
  const formatedTargetDate = format(targetDate, 'yyyy-MM-dd HH:mm:ss');
  const ISOTargetDate = parseISO(formatedTargetDate);
  const cal = new CalendarVietnamese();
  cal.fromGregorian(getYear(ISOTargetDate), parseInt(format(ISOTargetDate, 'M')), getDate(ISOTargetDate));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cycle, year, lunarMonth, leap, lunarDay] = cal.get();

  if (isSunday(ISOTargetDate)) {
    return true;
  }

  // Ngày nghỉ dương
  if (
    formatedTargetDate.includes('04-30') ||
    formatedTargetDate.includes('05-01') ||
    formatedTargetDate.includes('09-02') ||
    formatedTargetDate.includes('01-01')
  ) {
    return true;
  }

  // Ngày nghỉ âm
  if (
    (lunarDay === 10 && lunarMonth === 3) ||
    (lunarDay === 30 && lunarMonth === 12) ||
    (lunarDay === 31 && lunarMonth === 12) ||
    (lunarDay === 1 && lunarMonth === 1) ||
    (lunarDay === 2 && lunarMonth === 1) ||
    (lunarDay === 3 && lunarMonth === 1) ||
    (lunarDay === 4 && lunarMonth === 1) ||
    (lunarDay === 5 && lunarMonth === 1)
  ) {
    return true;
  }

  if (isOdd(countWeek - 1) && isSaturday(ISOTargetDate)) {
    return true;
  }

  return false;
}

function isOdd(n) {
  return Math.abs(n % 2) === 1;
}
</script>

<template>
  <div class="p-4">
    <h2 class="mb-4">Tháng {{ state.tinhChoThang }}</h2>
    <div class="mb-4">
      <strong>Ngày nghỉ full</strong>:
      {{ state.ngayNghiFull.map((item) => `${item}`).join(', ') }}
    </div>

    <div class="mb-4">
      <strong>Ngày đi làm khác với đã đăng ký</strong>:
      <div v-for="(objectKey, index) in Object.keys(state.ngayDiLamDacBiet)" :key="index">
        - Ngày <b>{{ objectKey }}</b> - làm {{ state.ngayDiLamDacBiet[objectKey] }}h
      </div>
    </div>

    <div class="mb-4">
      <strong>Ngày nghỉ hoặc đi làm thiếu giờ định kỳ</strong>:
      <div v-for="(item, index) in state.ngayDacBietDinhKy" :key="index">
        - Ngày <b>{{ item.ngay }}</b> - làm {{ item.soGio }}h
      </div>
    </div>

    <div class="mb-4"><strong>=> Số giờ làm việc</strong>: {{ state.soGioCong }}</div>
    <div><strong>=> Thành tiền</strong>: {{ state.thanhTien.toLocaleString() }}đ</div>
  </div>
</template>

<style scoped lang="scss" src="./styles.scss"></style>
