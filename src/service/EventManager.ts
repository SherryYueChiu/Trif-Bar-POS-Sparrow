class EventManager {
  static controlsDismissTriggerer: Function[] = [];

  dismissAllOrderControls() {
    EventManager.controlsDismissTriggerer.forEach((triggerer) => {
      triggerer?.();
    });
  }
  registerControlsDismissTriggerer(triggerer: Function) {
    EventManager.controlsDismissTriggerer.push(triggerer);
  }
}

export default new EventManager();
