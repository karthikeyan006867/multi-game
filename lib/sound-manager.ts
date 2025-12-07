import { Howl } from 'howler';

export class SoundManager {
  private sounds: Map<string, Howl> = new Map();
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private isMuted: boolean = false;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    // Game sounds
    const soundFiles = {
      click: '/sounds/click.mp3',
      win: '/sounds/win.mp3',
      lose: '/sounds/lose.mp3',
      coin: '/sounds/coin.mp3',
      powerup: '/sounds/powerup.mp3',
      explosion: '/sounds/explosion.mp3',
      jump: '/sounds/jump.mp3',
      hit: '/sounds/hit.mp3',
      combo: '/sounds/combo.mp3',
      achievement: '/sounds/achievement.mp3',
      levelup: '/sounds/levelup.mp3',
      background: '/sounds/background.mp3',
    };

    Object.entries(soundFiles).forEach(([key, src]) => {
      this.sounds.set(key, new Howl({
        src: [src],
        volume: key === 'background' ? this.musicVolume : this.sfxVolume,
        loop: key === 'background',
      }));
    });
  }

  play(soundName: string, options?: { volume?: number; loop?: boolean }) {
    if (this.isMuted) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      if (options?.volume !== undefined) {
        sound.volume(options.volume);
      }
      if (options?.loop !== undefined) {
        sound.loop(options.loop);
      }
      sound.play();
    }
  }

  stop(soundName: string) {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.stop();
    }
  }

  stopAll() {
    this.sounds.forEach(sound => sound.stop());
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    const bg = this.sounds.get('background');
    if (bg) bg.volume(this.musicVolume);
  }

  setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound, key) => {
      if (key !== 'background') {
        sound.volume(this.sfxVolume);
      }
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAll();
    }
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();
