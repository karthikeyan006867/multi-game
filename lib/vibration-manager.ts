export class VibrationManager {
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'vibrate' in navigator;
  }

  vibrate(pattern: number | number[]) {
    if (this.isSupported && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  light() {
    this.vibrate(50);
  }

  medium() {
    this.vibrate(100);
  }

  heavy() {
    this.vibrate(200);
  }

  success() {
    this.vibrate([50, 100, 50]);
  }

  error() {
    this.vibrate([100, 50, 100, 50, 100]);
  }

  combo() {
    this.vibrate([30, 30, 30, 30, 30]);
  }

  impact() {
    this.vibrate([10, 50, 10]);
  }

  cancel() {
    this.vibrate(0);
  }
}

export const vibrationManager = new VibrationManager();
