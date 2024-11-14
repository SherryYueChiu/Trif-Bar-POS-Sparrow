<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import DataService from "../service/DataService";
import OrderList from "./OrderList.vue";
import { OrderDTO, ProductsDTO } from "../dto/DTO";
import Swal from "sweetalert2";

const props = defineProps({
  bartenderId: String,
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
let showControls = ref<{ [key: string]: boolean }>({});

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

function onClickOrderRedelivery(order: OrderDTO) {
  Swal.fire({
    title: `讓「${order.orderId}號」重新候餐嗎？？`,
    icon: "info",
    showConfirmButton: true,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "是的",
    cancelButtonText: "不用",
  }).then((result) => {
    if (result.isConfirmed) {
      DataService.getOrderDB()
        .child(order.uuid)
        .transaction((orderDTO: OrderDTO) => {
          orderDTO.settled = false;
          return orderDTO;
        })
        .then((result) => {
          if (result.committed) {
            dismissAllDishesControls();
          } else {
            Swal.fire({
              title: "訂單更新失敗",
              icon: "error",
            });
          }
        })
        .catch((err) => {
          console.warn(err);
        });
    }
  });
}

function onClickOrderDeliveried(order: OrderDTO) {
  Swal.fire({
    title: `「${order.orderId}號」已經取餐了嗎？`,
    icon: "info",
    showConfirmButton: true,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "是的",
    cancelButtonText: "不用",
  }).then((result) => {
    if (result.isConfirmed) {
      DataService.getOrderDB()
        .child(order.uuid)
        .transaction((orderDTO: OrderDTO) => {
          orderDTO.settled = true;
          return orderDTO;
        })
        .then((result) => {
          if (result.committed) {
            dismissAllDishesControls();
          } else {
            Swal.fire({
              title: "訂單更新失敗",
              icon: "error",
            });
          }
        })
        .catch((err) => {
          console.warn(err);
        });
    }
  });
}

function onClickOrderRecook(order: OrderDTO) {
  Swal.fire({
    title: `要重做「${order.orderId}號單」嗎？`,
    icon: "info",
    showConfirmButton: true,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "是的",
    cancelButtonText: "不用",
  }).then((result) => {
    if (result.isConfirmed) {
      DataService.getOrderDB()
        .child(order.uuid)
        .transaction((orderDTO: OrderDTO) => {
          Object.keys(orderDTO.orderItems).forEach((key) => {
            orderDTO.orderItems[key].finished = false;
          });
          orderDTO.finished = false;
          orderDTO.settled = false;
          return orderDTO;
        })
        .then((result) => {
          if (result.committed) {
            dismissAllDishesControls();
          } else {
            Swal.fire({
              title: "訂單更新失敗",
              icon: "error",
            });
          }
        })
        .catch((err) => {
          console.warn(err);
        });
    }
  });
}

function manageOrderStatus(orderId: string) {
  if (!!showControls.value[orderId]) {
    dismissOrderControls(orderId);
    return;
  }
  dismissAllDishesControls();
  showControls.value[orderId] = true;
}

function dismissOrderControls(orderId: string) {
  showControls.value[orderId] = false;
}

function dismissAllDishesControls() {
  Object.keys(showControls.value).forEach((key) => {
    showControls.value[key] = false;
  });
}
</script>

<template>
  <div class="ordersOverview">
    <div class="wrapper">
      <div
        class="orderCard"
        v-for="order in orderList"
        :key="order.uuid"
        @click="manageOrderStatus(order.orderId)"
      >
        <div class="upper">
          <div class="orderNo">#{{ order?.orderId }}</div>
          <div class="customerName">{{ order?.customerName }}</div>
        </div>
        <div class="lower">
          <div class="progress" v-show="!order?.finished">
            {{ order?.orderItems?.filter((_) => _.finished)?.length }} /
            {{ order?.orderItems?.length }}
          </div>
          <div class="status">
            <div
              class="finished"
              v-show="
                order?.finished &&
                !order?.settled &&
                !showControls[order?.orderId]
              "
            >
              待取餐
            </div>
            <div
              class="deliveried"
              v-show="order?.settled && !showControls[order?.orderId]"
            >
              已取餐
            </div>
          </div>
          <div class="controls" v-show="!!showControls[order?.orderId]">
            <button
              class="delivery"
              @click.stop="onClickOrderDeliveried(order)"
              v-show="!order?.settled"
            >
              取餐
            </button>
            <button
              class="redelivery"
              @click.stop="onClickOrderRedelivery(order)"
              v-show="order?.settled"
            >
              候餐
            </button>
            <button class="recook" @click.stop="onClickOrderRecook(order)">
              重做
            </button>
            <button
              class="back"
              @click.stop="dismissOrderControls(order.orderId)"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ordersOverview {
  grid-column: 1 / 4;
  overflow-x: auto;
  width: 100%;

  & > .wrapper {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    width: 100%;
    height: 100%;
    padding: 10px 5px 10px 5px;
    border-radius: 10px;
    background-color: #eee;
    box-sizing: border-box;
    margin: auto;
  }
}

.wrapper > .orderCard + .orderCard {
  margin-left: 10px;
}

.ordersOverview > .wrapper {
  & > .orderCard {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 50% 50%;
    position: relative;
    padding: 5px;
    width: 6em;
    height: 100%;
    border-radius: 10px;
    background-color: #fff;
    box-sizing: border-box;
    user-select: none;
    overflow: hidden;

    & .upper {
      & > .orderNo {
        display: block;
        width: 100%;
        font-size: 1.5em;
        line-height: 2em;
        text-align: center;
        font-weight: 700;
        overflow: hidden;
      }
      & > .customerName {
        position: absolute;
        display: block;
        width: 100%;
        height: 1.5em;
        font-size: 1em;
        text-align: center;
        overflow: hidden;
        white-space: nowrap;
      }
    }

    & .lower {
      & > .progress {
        display: block;
        width: 100%;
        font-size: 1.5em;
        text-align: center;
        line-height: 3em;
        overflow: hidden;
      }
    }

    // 滿版呈現餐點狀態
    & .status {
      display: block;
      position: absolute;
      width: 100%;
      height: 40%;
      left: 0;
      top: 60%;
      opacity: 0.8;
      & > .finished {
        display: grid;
        place-items: center;
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        border-radius: 0 0 0.2em 0.2em;
        background-color: cadetblue;
        color: white;
        font-size: 1.5em;
        text-align: center;
        line-height: 1.8em;
        overflow: hidden;
      }
      & > .deliveried {
        display: grid;
        place-items: center;
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        border-radius: 0 0 0.2em 0.2em;
        background-color: limegreen;
        color: white;
        font-size: 1.5em;
        text-align: center;
        line-height: 1.8em;
        overflow: hidden;
      }
    }

    // 餐點狀態切換
    & .controls {
      display: flex;
      position: absolute;
      width: 100%;
      height: 40%;
      left: 0;
      top: 60%;
      opacity: 0.9;
      & > button {
        width: 33.3%;
        padding: 5px;
        background-color: #f0f0f0;
        font-size: 0.9em;
        cursor: pointer;
        &.delivery {
          border-radius: 0 0 0 10px;
          background-color: limegreen;
        }
        &.redelivery {
          border-radius: 0 0 0 10px;
          background-color: cadetblue;
        }
        &.recook {
          background-color: orangered;
        }
        &.back {
          border-radius: 0 0 10px 0;
          background-color: lightgray;
        }
      }
    }
  }
}
</style>
