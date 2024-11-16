import { ref } from "vue";
import { OrderDTO } from "../dto/DTO";
import AudioService from "./AudioService";
import DataService from "./DataService";
import Toastify from "toastify-js";
import Swal from "sweetalert2";

/** in minutes */
const deliveryTimeLimit = 10;

class EventManager {
  static controlsDismissTriggerer: Function[] = [];
  static orderHighlighted = ref<OrderDTO>(null);

  dismissAllOrderControls() {
    EventManager.controlsDismissTriggerer.forEach((triggerer) => {
      triggerer?.();
    });
  }
  registerControlsDismissTriggerer(triggerer: Function) {
    EventManager.controlsDismissTriggerer.push(triggerer);
  }

  getHighlightedOrder() {
    return EventManager.orderHighlighted;
  }
  hightlightAnOrder(order: OrderDTO) {
    EventManager.orderHighlighted.value = order;
  }
  unhighlightAnOrder() {
    EventManager.orderHighlighted.value = null;
  }

  pushOrderToWaitingList(order: OrderDTO) {
    const that = this;
    setTimeout(() => {
      if (!order.settled) {
        let tempOrderDTO: OrderDTO;
        const callbackSuccess = () => {
          const toast = Toastify({
            text: `#${order.orderId} 顧客已取餐ㅤㅤundo?`,
            duration: 4000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            onClick: function () {
              toast.hideToast();
              DataService.getOrderDB()
                .child(order.uuid)
                .transaction((orderDTO: OrderDTO) => {
                  return tempOrderDTO || orderDTO;
                })
                .then((result) => {
                  if (result.committed) {
                    that.pushOrderToWaitingList(order);
                  } else {
                    AudioService.playVfxError();
                    console.warn(result);
                    Swal.fire({
                      title: "訂單更新失敗",
                      icon: "error",
                    });
                  }
                })
                .catch((err) => {
                  AudioService.playVfxError();
                  console.warn(err);
                  Swal.fire({
                    title: "訂單更新失敗",
                    icon: "error",
                  });
                });
            },
          }).showToast();
        };

        AudioService.playVfxError();
        Swal.fire({
          icon: "error",
          title: `「${order.orderId}號單」閒置過久`,
          text: '請確認是否已經出餐？',
          confirmButtonText: '已經出餐',
          cancelButtonText: '還沒',
          showCancelButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            DataService.getOrderDB()
              .child(order.uuid)
              .transaction((orderDTO: OrderDTO) => {
                tempOrderDTO = structuredClone(orderDTO);
                orderDTO.settled = true;
                return orderDTO;
              })
              .then((result) => {
                if (result.committed) {
                  that.dismissAllOrderControls();
                  that.unhighlightAnOrder();
                  callbackSuccess();
                } else {
                  AudioService.playVfxError();
                  console.warn(result);
                  Swal.fire({
                    title: "訂單更新失敗",
                    icon: "error",
                  });
                }
              })
              .catch((err) => {
                AudioService.playVfxError();
                console.warn(err);
                Swal.fire({
                  title: "訂單更新失敗",
                  icon: "error",
                });
              });
          }
        });;
      }
    }, 1000 * 60 * deliveryTimeLimit);
  }
}

export default new EventManager();
