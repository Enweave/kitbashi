import {Ref, ref} from 'vue';
import { clamp } from './Utils.ts';

export enum SFXSetType {
  fire,
  fireAlt,
  explosion,
  hit,
}

class SFXFileList {
  directory: string = './sound/sfx/';
  filesNames: string[] = [];

  constructor(fileNames: string[] = []) {
    this.filesNames = fileNames;
  }
}

class SFX {
  fileList: SFXFileList;
  _currentFileIndex: number = 0;
  _lastPlayedIndex: number = -1;
  _lastFileIndex: number = 0;
  _numOfFiles: number = 0;

  cacheMap: any = new Map(<[string, string][]>[]);

  constructor(fileNames: string[] = []) {
    this.fileList = new SFXFileList(fileNames);
    this._numOfFiles = this.fileList.filesNames.length;
    this._lastFileIndex = this._numOfFiles - 1;

    for (let i = 0; i < this._numOfFiles; i++) {
      this.cacheFile(this.fileList.directory + this.fileList.filesNames[i]);
    }
  }

  cacheFile(src: string) {
    if (!this.cacheMap[src]) {
      fetch(src).then((response) => {
        const type = response.headers.get('content-type');
        if (!type) {
          return;
        }
        if (!type.includes('audio')) {
          console.error(`${src} is not an audio file`);
          return;
        }
        response.arrayBuffer().then((buffer) => {
          const blob = new Blob([buffer], { type: type });
          this.cacheMap[src] = URL.createObjectURL(blob);
        });
      });
    }
  }

  getFile(src: string): string | null {
    if (this.cacheMap[src]) {
      return this.cacheMap[src];
    }
    return null;
  }

  getCurrentFileSrc(): string | null {
    const currentFile = this.fileList?.filesNames[this._currentFileIndex];
    this._lastPlayedIndex = this._currentFileIndex;
    return this.getFile(this.fileList?.directory + currentFile);
  }

  randomNextIndex() {
    if (this._lastFileIndex > 0) {
      let nextIndex = Math.floor(Math.random() * this._lastFileIndex);
      if (nextIndex === this._lastPlayedIndex) {
        nextIndex++;
      }
      if (nextIndex > this._lastFileIndex) {
        nextIndex = 0;
      }

      this._currentFileIndex = nextIndex;
    }
  }
}

class SFXRegistry {
  sfxMap: Map<SFXSetType, SFX> = new Map();

  constructor() {
    this.sfxMap = new Map([
      [SFXSetType.fire, new SFX([
          'Fire Master-bounce-1.mp3',
          'Fire Master-bounce-2.mp3',
          'Fire Master-bounce-3.mp3',
          'Fire Master-bounce-4.mp3',
      ])],
      [SFXSetType.fireAlt, new SFX([
        'FireAlt Master-bounce-1.mp3',
        'FireAlt Master-bounce-2.mp3',
        'FireAlt Master-bounce-3.mp3',
        'FireAlt Master-bounce-4.mp3',
      ])],
      [SFXSetType.hit, new SFX([
        'hit Master-bounce-1.mp3',
        'hit Master-bounce-2.mp3',
        'hit Master-bounce-3.mp3',
        'hit Master-bounce-4.mp3',
      ])],
      [SFXSetType.explosion, new SFX([
          'explode Master-bounce-1.mp3',
          'explode Master-bounce-2.mp3',
          'explode Master-bounce-3.mp3',
          'explode Master-bounce-4.mp3',
      ])],
    ]);
  }
}

export class SFXPlayer {
  sfx: SFX | null = null;
  lastPlayed: Date = new Date(new Date().getTime());
  balance: number = 0;
  volume: number = 1;
  currentSrc: string = '';
  busy: boolean = false;

  playCallback() {}

  constructor(inSFX: SFX) {
    this.sfx = inSFX;
  }

  play() {
    if (this.sfx) {
      this.sfx.randomNextIndex();
      const src = this.sfx.getCurrentFileSrc();
      if (src) {
        this.currentSrc = src;
        this.lastPlayed = new Date();
        this.busy = true;
        this.playCallback();
      }
    }
  }
}

export class SoundController {
  sfxRegistry: SFXRegistry;
  sfxLevel: number = 1;
  musicLevel: number = 1;

  sfxPlayers: Ref<SFXPlayer[]> = ref([]);
  musicPlayer: Ref<HTMLAudioElement | null, HTMLElement | null> = ref(null);
  musicBlobURL: string = '';
  MAX_SFX_PLAYERS: number = 30;

  constructor(musicPlayer: Ref<HTMLAudioElement | null, HTMLElement | null> = ref(null)) {
    this.sfxRegistry = new SFXRegistry();
    for (let i = 0; i < this.MAX_SFX_PLAYERS; i++) {
      this.sfxPlayers.value.push(new SFXPlayer(new SFX()));
    }

    this.musicPlayer = musicPlayer;
    this.playMusic();
  }

  _playMusic() {
    if (this.musicPlayer.value) {
      this.musicPlayer.value.src = this.musicBlobURL;
      this.musicPlayer.value.volume = this.musicLevel;
      this.musicPlayer.value.loop = true;
      this.musicPlayer.value.play();
    }
  }

  playMusic() {
    if (this.musicPlayer.value) {
      fetch('./sound/music/backfire.mp3').then((response) => {
        const type = response.headers.get('content-type');
        if (!type) {
          return;
        }
        response.arrayBuffer().then((buffer) => {
          const blob = new Blob([buffer], { type: type });
          this.musicBlobURL = URL.createObjectURL(blob);
          this._playMusic();
        });
      });
    } else {
      this._playMusic()
    }
  }

  setSFXLevel(level: number) {
    this.sfxLevel = level;
  }

  setMusicLevel(level: number) {
    this.musicLevel = level;
    if (this.musicPlayer.value) {
      this.musicPlayer.value.volume = this.musicLevel;
    }
  }

  getSFXPlayer(): SFXPlayer | undefined {
    let player: SFXPlayer | undefined = undefined;
    player = this.sfxPlayers.value.find((player) => !player.busy);

    // if no free player found, find the oldest player
    if (!player) {
      player = this.sfxPlayers.value.reduce((oldest, current) => {
        return oldest.lastPlayed < current.lastPlayed ? oldest : current;
      });
    }

    return player;
  }

  playSFX(sfxType: SFXSetType, balance: number = 0, volume: number = 1) {
    if (this.sfxLevel === 0) {
      return;
    }

    const finalBalance = clamp(balance, -1, 1);
    const finalVolume = clamp(volume, 0, 1) * this.sfxLevel;

    const player = this.getSFXPlayer();

    if (player) {
      player.balance = finalBalance;
      player.volume = finalVolume;
      player.sfx = this.sfxRegistry.sfxMap.get(sfxType) || null;
      player.play();
    }

    // eslint-disable-next-line no-self-assign
    this.sfxPlayers.value = this.sfxPlayers.value;
  }

}
