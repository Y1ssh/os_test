// Audio player application for Linux 95 Desktop
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

export class AudioPlayerApp implements AppInterface {
  config: AppConfig = {
    id: 'audioPlayer',
    title: 'XMMS Audio Player',
    icon: '🎵',
    category: 'multimedia',
    windowConfig: {
      width: 400,
      height: 300,
      resizable: false
    }
  };

  private element!: HTMLElement;
  private visualizer!: HTMLElement;
  private trackInfo!: HTMLElement;
  private cleanupTasks: (() => void)[] = [];
  private isPlaying = false;
  private currentTrack = 0;
  private animationId?: number;

  private tracks = [
    { title: 'Linux95_Theme.mp3', artist: 'Retro Digital', duration: '3:42' },
    { title: 'Terminal_Vibes.mp3', artist: 'Command Line', duration: '4:15' },
    { title: 'Nostalgic_Computing.mp3', artist: 'Old School', duration: '3:28' }
  ];

  init(): void {
    // Initialize player
  }

  render(): HTMLElement {
    this.element = createElement('div', 'audio-player-app');
    
    this.createVisualizer();
    this.createTrackInfo();
    this.createControls();
    this.createPlaylist();
    this.updateTrackInfo();
    
    return this.element;
  }

  private createVisualizer(): void {
    this.visualizer = createElement('div', 'audio-visualizer');
    
    // Create visualizer bars
    for (let i = 0; i < 16; i++) {
      const bar = createElement('div', 'visualizer-bar');
      this.visualizer.appendChild(bar);
    }
    
    this.element.appendChild(this.visualizer);
  }

  private createTrackInfo(): void {
    this.trackInfo = createElement('div', 'track-info');
    this.element.appendChild(this.trackInfo);
  }

  private createControls(): void {
    const controls = createElement('div', 'audio-controls');
    
    const prevBtn = createElement('button', 'audio-btn', '⏮️');
    const playBtn = createElement('button', 'audio-btn play-btn', '▶️');
    const nextBtn = createElement('button', 'audio-btn', '⏭️');
    const stopBtn = createElement('button', 'audio-btn', '⏹️');

    addEventListenerWithCleanup(prevBtn, 'click', () => {
      this.previousTrack();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(playBtn, 'click', () => {
      this.togglePlayback();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(nextBtn, 'click', () => {
      this.nextTrack();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(stopBtn, 'click', () => {
      this.stopPlayback();
    }, this.cleanupTasks);

    controls.appendChild(prevBtn);
    controls.appendChild(playBtn);
    controls.appendChild(nextBtn);
    controls.appendChild(stopBtn);
    
    this.element.appendChild(controls);
  }

  private createPlaylist(): void {
    const playlist = createElement('div', 'audio-playlist');
    const playlistTitle = createElement('div', 'playlist-title', 'Playlist:');
    playlist.appendChild(playlistTitle);
    
    this.tracks.forEach((track, index) => {
      const trackItem = createElement('div', 'playlist-item');
      if (index === this.currentTrack) {
        trackItem.classList.add('current');
      }
      
      trackItem.innerHTML = `
        <span class="track-title">${track.title}</span>
        <span class="track-duration">${track.duration}</span>
      `;
      
      addEventListenerWithCleanup(trackItem, 'click', () => {
        this.selectTrack(index);
      }, this.cleanupTasks);
      
      playlist.appendChild(trackItem);
    });
    
    this.element.appendChild(playlist);
  }

  private updateTrackInfo(): void {
    const track = this.tracks[this.currentTrack];
    this.trackInfo.innerHTML = `
      <div class="current-track">${track.title}</div>
      <div class="current-artist">${track.artist}</div>
      <div class="track-time">00:00 / ${track.duration}</div>
    `;

    // Update playlist highlighting
    const playlistItems = this.element.querySelectorAll('.playlist-item');
    playlistItems.forEach((item, index) => {
      item.classList.toggle('current', index === this.currentTrack);
    });
  }

  private togglePlayback(): void {
    const playBtn = this.element.querySelector('.play-btn') as HTMLElement;
    
    if (this.isPlaying) {
      this.isPlaying = false;
      playBtn.textContent = '▶️';
      this.stopVisualizerAnimation();
    } else {
      this.isPlaying = true;
      playBtn.textContent = '⏸️';
      this.startVisualizerAnimation();
    }
  }

  private stopPlayback(): void {
    this.isPlaying = false;
    const playBtn = this.element.querySelector('.play-btn') as HTMLElement;
    playBtn.textContent = '▶️';
    this.stopVisualizerAnimation();
  }

  private previousTrack(): void {
    this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
    this.updateTrackInfo();
  }

  private nextTrack(): void {
    this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    this.updateTrackInfo();
  }

  private selectTrack(index: number): void {
    this.currentTrack = index;
    this.updateTrackInfo();
  }

  private startVisualizerAnimation(): void {
    const animate = () => {
      if (!this.isPlaying) return;
      
      const bars = this.visualizer.querySelectorAll('.visualizer-bar') as NodeListOf<HTMLElement>;
      bars.forEach(bar => {
        const height = Math.random() * 80 + 10; // Random height between 10-90%
        bar.style.height = `${height}%`;
      });
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  private stopVisualizerAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
    
    // Reset visualizer bars
    const bars = this.visualizer.querySelectorAll('.visualizer-bar') as NodeListOf<HTMLElement>;
    bars.forEach(bar => {
      bar.style.height = '10%';
    });
  }

  cleanup(): void {
    this.stopVisualizerAnimation();
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export default AudioPlayerApp; 