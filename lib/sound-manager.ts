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
    // Game sounds - using data URIs for silent audio to prevent 404 errors
    const silentAudio = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4T/////////////////////////////////////////////////';
    
    const soundFiles = {
      click: silentAudio,
      win: silentAudio,
      lose: silentAudio,
      coin: silentAudio,
      powerup: silentAudio,
      explosion: silentAudio,
      jump: silentAudio,
      hit: silentAudio,
      combo: silentAudio,
      achievement: silentAudio,
      levelup: silentAudio,
      background: silentAudio,
      error: silentAudio,
    };

    Object.entries(soundFiles).forEach(([key, src]) => {
      try {
        this.sounds.set(key, new Howl({
          src: [src],
          volume: key === 'background' ? this.musicVolume : this.sfxVolume,
          loop: key === 'background',
          html5: true,
          onloaderror: () => {
            console.warn(`Sound ${key} failed to load, using silent fallback`);
          },
        }));
      } catch (error) {
        console.warn(`Failed to initialize sound ${key}:`, error);
      }
    });
  }

  play(soundName: string, options?: { volume?: number; loop?: boolean }) {
    if (this.isMuted) return;
    
    try {
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
    } catch (error) {
      // Silently fail if sound cannot be played
      console.debug(`Sound ${soundName} could not be played:`, error);
    }
  }

  stop(soundName: string) {
    try {
      const sound = this.sounds.get(soundName);
      if (sound) {
        sound.stop();
      }
    } catch (error) {
      console.debug(`Failed to stop sound ${soundName}:`, error);
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
