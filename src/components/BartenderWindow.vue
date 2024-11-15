<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import DataService from "../service/DataService";
import OrderList from "./OrderList.vue";
import { OrderDTO, ProductsDTO } from "../dto/DTO";

const props = defineProps({
  bartenderId: String,
  bartenders: {
    type: Array as () => Array<string>,
    default: () => [],
  },
  orderList: {
    type: Array as () => Array<OrderDTO>,
    default: () => [],
  },
  productList: {
    type: Object as () => ProductsDTO,
    default: () => {},
  },
});

let bartenderName = ref("");
let orderList = ref([]);
let productList = ref({});

onMounted(async () => {
  DataService.getBartenderDB()
    .child(props.bartenderId)
    .on("value", updateBartenderName);
});
onBeforeUnmount(() => {
  DataService.getBartenderDB()
    .child(props.bartenderId)
    .off("value", updateBartenderName);
});

watch(
  () => props.orderList,
  () => {
    orderList.value = props.orderList;
  },
  { immediate: true }
);
watch(
  () => props.productList,
  () => {
    productList.value = props.productList;
  },
  { immediate: true }
);

function updateBartenderName(data) {
  bartenderName.value = data.val();
}
</script>

<template>
  <div class="bartenderWindow">
    <div class="wrapper">
      <header>
        <div class="title">{{ bartenderName }}</div>
      </header>
      <div class="listContainer">
        <OrderList
          :bartenders="bartenders"
          :bartender-id="props.bartenderId"
          :order-list="orderList"
          :product-list="productList"
        ></OrderList>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bartenderWindow+.bartenderWindow{
  padding-left: 2px;
}
.bartenderWindow {
  padding: 12px 10px 10px;

  & > .wrapper {
    // position: fixed;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 10px;
    background-color: #DDD;
    box-sizing: border-box;
    margin: auto;
  }

  & > .wrapper > header {
    padding: 5px;
    width: 100%;
    height: 30px;
    text-align: center;

    & > .title {
      padding: 10px;
      font-size: 20px;
      font-weight: 700;
    }
  }

  & > .wrapper > .listContainer {
    height: calc(100% - 70px);
    overflow-y: auto;
  }
}
</style>
