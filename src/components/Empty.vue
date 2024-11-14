<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
// import DataService from '../service/DataService';

onMounted(async () => {
  // DataService.getAll().on("value", onDataChange);
})
onBeforeUnmount(() => {
  // DataService.getAll().off("value", onDataChange);
})
</script>

<template>
</template>

<style scoped lang="scss">

</style>
