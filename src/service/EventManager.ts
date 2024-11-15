import { ref } from "vue";
import { OrderDTO } from "../dto/DTO";

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
}

export default new EventManager();
