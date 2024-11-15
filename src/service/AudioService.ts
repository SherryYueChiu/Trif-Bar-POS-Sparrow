class AudioService {
  static audio_empty: HTMLAudioElement;
  static audio_orderBell: HTMLAudioElement;
  static audio_click: HTMLAudioElement;
  static audio_windowShowUp: HTMLAudioElement;
  static audio_windowDismiss: HTMLAudioElement;
  static audio_error: HTMLAudioElement;
  
  /** for testing */
  playVfxEmpty() {
    if (!AudioService.audio_empty) {
      AudioService.audio_empty = new Audio();
      AudioService.audio_empty.src = new URL('../assets/audio/empty-audio.mp3', import.meta.url).href;
    }
    AudioService.audio_empty.play();
  }

  playVfxOrderBell() {
    if (!AudioService.audio_orderBell) {
      AudioService.audio_orderBell = new Audio();
      AudioService.audio_orderBell.src = new URL('../assets/audio/order-bell.mp3', import.meta.url).href;
    }
    AudioService.audio_orderBell.load();
    AudioService.audio_orderBell.play();
  }

  playVfxClick() {
    if (!AudioService.audio_click) {
      AudioService.audio_click = new Audio();
      AudioService.audio_click.src = new URL('../assets/audio/btn-click.wav', import.meta.url).href;
    }
    AudioService.audio_click.load();
    AudioService.audio_click.play();
  }

  playVfxWindowShowUp() {
    if (!AudioService.audio_windowShowUp) {
      AudioService.audio_windowShowUp = new Audio();
      AudioService.audio_windowShowUp.src = new URL('../assets/audio/window_in.wav', import.meta.url).href;
    }
    AudioService.audio_windowShowUp.load();
    AudioService.audio_windowShowUp.play();
  }

  playVfxWindowDismiss() {
    if (!AudioService.audio_windowDismiss) {
      AudioService.audio_windowDismiss = new Audio();
      AudioService.audio_windowDismiss.src = new URL('../assets/audio/window_out.wav', import.meta.url).href;
    }
    AudioService.audio_windowDismiss.load();
    AudioService.audio_windowDismiss.play();
  }

  playVfxError() {
    if (!AudioService.audio_error) {
      AudioService.audio_error = new Audio();
      AudioService.audio_error.src = new URL('../assets/audio/error.wav', import.meta.url).href;
    }
    AudioService.audio_error.load();
    AudioService.audio_error.play();
  }
}

export default new AudioService();
