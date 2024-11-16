<script setup lang="ts">
import { onBeforeUnmount, onErrorCaptured, onMounted, ref } from "vue";
import OrdersOverview from "./components/OrdersOverview.vue";
import BartenderWindow from "./components/BartenderWindow.vue";
import DataService from "./service/DataService";
import AudioService from "./service/AudioService";
import { OrderDTO, ProductsDTO } from "./dto/DTO";
import Swal from "sweetalert2";

let _showOrderControl = ref(false);
let clickedOrderData = ref<OrderDTO>();
let clickedOrderFromBartender = ref<number>(1);
let bartenders = ref();
let orderList = ref<OrderDTO[]>();
let productList = ref<ProductsDTO>({});
let prevOrdersAmount = null;

onMounted(async () => {
  onInit();
  DataService.getOrderDB().on("value", updateOrderList);
  DataService.getBartenderDB().on("value", updateBartenderName);
  DataService.getProductDB().on("value", updateProductList);
});
onBeforeUnmount(() => {
  DataService.getOrderDB().off("value", updateOrderList);
  DataService.getBartenderDB().off("value", updateBartenderName);
  DataService.getProductDB().off("value", updateProductList);
});
onErrorCaptured((err) => {
  console.warn(err);
});

function onInit() {
  console.log("version: 2.2");
  Swal.fire({
    title: "開始使用 Trif Bar POS 2.2",
    icon: "info",
  }).then(() => {
    AudioService.playVfxEmpty();
  });
}

function updateBartenderName(data) {
  bartenders.value = data.val();
}

function updateOrderList(data) {
  // 有新訂單
  let ordersAmount = Object.values(data.val()).length;
  if (ordersAmount > prevOrdersAmount && prevOrdersAmount !== null) {
    AudioService.playVfxOrderBell();
  }
  prevOrdersAmount = ordersAmount;

  orderList.value = Object.values(data.val())
    .filter((_: any) => _ !== "placeholder")
    .filter((_: any) => _?.destroyed !== true)
    .sort((a: OrderDTO, b: OrderDTO) => {
      if (a?.finished && !b?.finished) {
        return 1;
      } else if (!a?.finished && b?.finished) {
        return -1;
      } else {
        return b.orderId - a.orderId;
      }
    }) as OrderDTO[];
  // console.warn("orderList", orderList);
}

function updateProductList(data) {
  productList.value = data.val();
}
</script>

<template>
  <div class="main">
    <OrdersOverview :order-list="orderList" :product-list="productList" />
    <BartenderWindow
      bartender-id="1"
      :bartenders="bartenders"
      :order-list="orderList"
      :product-list="productList"
    >
    </BartenderWindow>
    <BartenderWindow
      bartender-id="2"
      :bartenders="bartenders"
      :order-list="orderList"
      :product-list="productList"
    >
    </BartenderWindow>
    <BartenderWindow
      bartender-id="3"
      :bartenders="bartenders"
      :order-list="orderList"
      :product-list="productList"
    >
    </BartenderWindow>
  </div>
</template>

<style scoped lang="scss">
.main {
  position: absolute;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: max(20vh, 8em) 1fr;
  width: 100%;
  height: 100%;
}
</style>
