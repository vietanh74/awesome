<script setup lang="ts">
import { reactive, onMounted } from 'vue';

import { size } from 'lodash-es';

const SETUP_VAR = {
  tinhChoThang: 9,
  myTongCong: 22,
  ngayNghiFull: [7, 8, 23],
  ngayLam3h: [1, 13, 20, 24, 27, 30],
};

const state = reactive({
  ...SETUP_VAR,
  soNgayCong: 0,
  thanhTien: 0,
});

onMounted(() => {
  state.soNgayCong = state.myTongCong - size(state.ngayNghiFull) - (size(state.ngayLam3h) * 1) / 4;
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
