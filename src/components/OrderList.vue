<script setup lang="ts">
import { ref, watch } from "vue";
import DataService from "../service/DataService";
import { ItemInOrderDTO, OrderDTO, ProductsDTO } from "../dto/DTO";
import Swal from "sweetalert2";

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

let orderList = ref<OrderDTO[]>();
let productList = ref({});
let showControls = ref<{ [key: string]: boolean }>({});

watch(
  () => props.orderList,
  () => {
    orderList.value = props.orderList
      .filter((_: OrderDTO) =>
        Object.values(_?.orderItems || {}).some(
          (_) => _?.preferBartender === +props.bartenderId
        )
      )
      .slice()
      .sort((a, b) => {
        if (a.finished && !b.finished) return 1;
        if (!a.finished && b.finished) return -1;
        return 0;
      });
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

function onClickPrepared(order: OrderDTO, dish: ItemInOrderDTO) {
  setDishFinished(true, order, dish);
}
function onClickRecook(order: OrderDTO, dish: ItemInOrderDTO) {
  setDishFinished(false, order, dish);
}

function setDishFinished(
  isFinished: boolean,
  order: OrderDTO,
  dish: ItemInOrderDTO
) {
  const dishName = productList.value[dish.productId].name;
  Swal.fire({
    title: isFinished
      ? dish.amount > 1
        ? `「${dish.amount}」份「${dishName}」都做完了嗎？`
        : `「${dishName}」做完了嗎？`
      : `要重做「${dishName}」嗎？`,
    icon: "info",
    showConfirmButton: true,
    showDenyButton: false,
    showCancelButton: true,
    confirmButtonText: "是的",
    cancelButtonText: isFinished ? "還沒" : "不用",
  }).then((result) => {
    if (result.isConfirmed) {
      DataService.getOrderDB()
        .child(order.uuid)
        .transaction((orderDTO: OrderDTO) => {
          Object.keys(orderDTO.orderItems).forEach((key) => {
            const orderItem = orderDTO.orderItems[key];
            if (
              orderItem.preferBartender == +props.bartenderId &&
              orderItem.productId === dish.productId
            ) {
              order.orderItems[key].finished = true;
              orderDTO.orderItems[key].finished = isFinished;
            }
          });
          return orderDTO;
        })
        .then(() => {
          dismissAllDishesControls();
          Swal.fire({
            title: "OK",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
          if (
            isFinished &&
            Object.values(order.orderItems).every((item) => item.finished)
          ) {
            DataService.getOrderDB()
              .child(order.uuid)
              .transaction((orderDTO: OrderDTO) => {
                console.log(orderDTO);
                orderDTO.finished = true;
                return orderDTO;
              })
              .then((result) => {
                if (result.committed) {
                  Swal.fire({
                    title: "訂單完成",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                  });
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
          } else if (
            !isFinished &&
            Object.values(order.orderItems).some((item) => item.finished)
          ) {
            DataService.getOrderDB()
              .child(order.uuid)
              .transaction((orderDTO: OrderDTO) => {
                orderDTO.finished = false;
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
        })
        .catch((err) => {
          console.warn(err);
        });
    }
  });
}

function onClickReassign(order: OrderDTO, dish: ItemInOrderDTO) {
  Swal.fire({
    title: `要把「${productList.value[dish.productId].name}」轉給誰？`,
    icon: "info",
    input: "select",
    inputOptions: Array(3)
      .fill({})
      .map((_, key) => {
        return { ["" + (key + 1)]: props.bartenders[key + 1] };
      })
      .reduce(function (result, item) {
        var key = Object.keys(item)[0];
        result[key] = item[key];
        return result;
      }, {}),
  }).then((result) => {
    if (result.isConfirmed) {
      DataService.getOrderDB()
        .child(order.uuid)
        .transaction((orderDTO: OrderDTO) => {
          Object.keys(orderDTO.orderItems).forEach((key) => {
            const orderItem = orderDTO.orderItems[key];
            if (
              orderItem.preferBartender == +props.bartenderId &&
              orderItem.productId === dish.productId
            ) {
              orderDTO.orderItems[key].preferBartender = +result.value;
            }
          });
          return orderDTO;
        })
        .then(() => {
          dismissAllDishesControls();
          Swal.fire({
            title: `已轉給${props.bartenders[result.value]}`,
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        })
        .catch((err) => {
          console.warn(err);
        });
    }
  });
}

function manageDishStatus(orderId: number, productId: string) {
  dismissAllDishesControls();
  showControls.value[`${orderId}-${productId}`] = true;
}

function dismissDishControls(orderId: number, productId: string) {
  showControls.value[`${orderId}-${productId}`] = false;
}

function dismissAllDishesControls() {
  Object.keys(showControls.value).forEach((key) => {
    showControls.value[key] = false;
  });
}
</script>

<template>
  <div class="orderList">
    <!-- 列舉同訂單下的品項 -->
    <div class="orderCardSets" v-for="order in orderList" :key="order.uuid">
      <!-- 一個品項一張卡片 -->
      <div
        v-for="dish in Object.values(order.orderItems)
          .filter((_) => _.preferBartender === +props.bartenderId)
          .sort((a, b) => {
            if (a.finished && !b.finished) return 1;
            if (!a.finished && b.finished) return -1;
            return 0;
          })"
        :key="dish.productId"
        class="orderCard"
        @click.stop="manageDishStatus(order.orderId, dish.productId)"
      >
        <div class="owner">#{{ order.orderId }}</div>
        <div class="dishDetail">
          <a class="dishName">{{ productList?.[dish.productId]?.name }}</a>
          <div class="specialNeeded" v-show="dish?.spec">
            - {{ dish?.spec || "" }}
          </div>
          <div class="amount" v-show="dish?.amount > 1">
            x {{ dish.amount }}
          </div>
        </div>
        <div class="status">
          <div
            class="finished"
            v-show="
              dish.finished &&
              !showControls[`${order.orderId}-${dish.productId}`]
            "
          >
            已完成
          </div>
        </div>
        <div
          class="controls"
          v-show="!!showControls[`${order.orderId}-${dish.productId}`]"
        >
          <button class="reassgin" @click.stop="onClickReassign(order, dish)">
            轉單
          </button>
          <button
            class="prepared"
            @click.stop="onClickPrepared(order, dish)"
            v-show="!dish.finished"
          >
            完成
          </button>
          <button
            class="recook"
            @click.stop="onClickRecook(order, dish)"
            v-show="dish.finished"
          >
            重做
          </button>
          <button
            class="back"
            @click.stop="dismissDishControls(order.orderId, dish.productId)"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.orderList {
  padding: 10px;
}

.orderCardSets .orderCard + .orderCard {
  margin-top: 10px;
}

.orderCardSets + .orderCardSets {
  margin-top: 10px;
}

.orderList .orderCard {
  position: relative;
  padding: 5px;
  border-radius: 10px;
  background-color: #fff;
  user-select: none;

  & > .title {
    padding: 5px;
    margin-bottom: 10px;
    border-bottom: 2px solid gray;

    & > .orderId {
      padding: 0 0px 0 10px;
    }

    & > .customerName {
      max-width: calc(100% - 4em);
      display: inline-block;
      padding: 0 10px 0 10px;
      max-width: calc(100% - 100px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transform: translateY(5px);
    }
  }

  & > .owner {
    display: block;
    position: absolute;
    top: 0.6em;
    right: 0;
    transform: translateY(-0.6em);
    padding: 0.2em 0.5em;
    width: fit-content;
    border-radius: 0.2em 0.6em 0.2em 0.4em;
    font-weight: 500;
    color: #fff;
    background-color: #888;
  }
  & > .dishDetail {
    margin: 1em 0 1em;
    & > .dishName {
      display: block;
      padding: 0 1.8em 0 1em;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    & > .specialNeeded {
      display: block;
      padding: 0 1em 0;
      color: #555;
    }
    & > .amount {
      position: absolute;
      right: 0.2em;
      bottom: 0;
      font-size: 2em;
      transform: rotate(-10deg);
      font-weight: 700;
      text-shadow: 1px 1px 3px #444;
    }
  }

  // 滿版呈現餐點狀態
  & > .status {
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    opacity: 0.8;
    & > .finished {
      display: grid;
      place-items: center;
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      border-radius: 0.2em;
      background-color: limegreen;
      color: white;
      font-size: 2em;
      text-align: center;
      line-height: 1.8em;
      overflow: hidden;
    }
  }

  // 餐點狀態切換
  & > .controls {
    display: flex;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    opacity: 0.9;
    & > button {
      width: 33.3%;
      padding: 5px 10px;
      border-radius: 5px;
      background-color: #f0f0f0;
      font-size: 1.5em;
      cursor: pointer;
      &.reassgin {
        background-color: lightblue;
      }
      &.prepared {
        background-color: limegreen;
      }
      &.recook {
        background-color: orangered;
      }
      &.back {
        background-color: lightgray;
      }
    }
  }
}
</style>
