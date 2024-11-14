class AudioService {
  static audio_orderBell: HTMLAudioElement;
  static audio_empty: HTMLAudioElement;

  playVfxOrderBell() {
    if (!AudioService.audio_orderBell) {
      AudioService.audio_orderBell = new Audio();
      AudioService.audio_orderBell.src = new URL('../assets/audio/order-bell.mp3', import.meta.url).href;
    }
    AudioService.audio_orderBell.play();
  }
  playVfxClick() {
    if (!AudioService.audio_orderBell) {
      AudioService.audio_orderBell = new Audio();
      AudioService.audio_orderBell.src = new URL('../assets/audio/btn-click.wav', import.meta.url).href;
    }
    AudioService.audio_orderBell.play();
  }
  playVfxEmpty() {
    if (!AudioService.audio_empty) {
      AudioService.audio_empty = new Audio();
      AudioService.audio_empty.src = new URL('../assets/audio/empty-audio.mp3', import.meta.url).href;
    }
    AudioService.audio_empty.play();
  }
}

export default new AudioService();
