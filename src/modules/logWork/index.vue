<script setup lang="ts">
import { reactive, onMounted } from 'vue';

import { size } from 'lodash-es';

const SETUP_VAR = {
  tinhChoThang: 11,
  myTongCong: 24,
  ngayNghiFull: '4 21'.split(' '),
  ngayLam3h: '1 5 8 10 11 12 15 18 22 25 29'.split(' '),
  ngayLam2h: '2'.split(' '),
};

const state = reactive({
  ...SETUP_VAR,
  soNgayCong: 0,
  thanhTien: 0,
});

onMounted(() => {
  state.soNgayCong =
    state.myTongCong - size(state.ngayNghiFull) - (size(state.ngayLam3h) * 1) / 4 - size(state.ngayLam2h) / 2;
  state.thanhTien = state.soNgayCong * 4 * 20000;
});
</script>

<template>
  <div class="p-4">
    <h2 class="mb-4">Tháng {{ state.tinhChoThang }}</h2>
    <div class="mb-4"><strong>Công chuẩn</strong>: {{ state.myTongCong }}</div>
    <div class="mb-4">
      <strong>Số ngày nghỉ full</strong>:
      {{ state.ngayNghiFull.map((item) => `${item}/${state.tinhChoThang}`).join(', ') }}
    </div>
    <div class="mb-4">
      <strong>Số ngày làm 3h</strong>:
      {{ state.ngayLam3h.map((item) => `${item}/${state.tinhChoThang}`).join(', ') }}
    </div>
    <div class="mb-4"><strong>=> Số ngày làm việc quy đủ công</strong>: {{ state.soNgayCong }}</div>
    <div><strong>=> Thành tiền</strong>: {{ state.thanhTien.toLocaleString() }}đ</div>
  </div>
</template>

<style scoped lang="scss" src="./styles.scss"></style>
