class MusicService {
  constructor() {
    this.clientId = "be6f3480";
    this.baseUrl = 'https://api.jamendo.com/v3.0';
    this.currentTrack = null;
    this.audio = new Audio();
    this.isLoading = false;
    
    this.audio.addEventListener('ended', () => {
      this.currentTrack = null;
    });
  }

  getMoodQuery(moodObj) {
    const moodString = (moodObj && typeof moodObj === 'object' ? moodObj.mood : moodObj) || 'neutral';
    
    const moodMap = {
      happy: 'happy',
      sad: 'sad',
      energetic: 'energetic',
      calm: 'relaxing',
      neutral: 'pop'
    };

    return moodMap[moodString.toLowerCase()] || moodMap.neutral;
  }

  async getRecommendations(mood) {
    try {
      console.log('Getting recommendations for mood:', mood);
      const query = this.getMoodQuery(mood);
      
      const response = await fetch(
        `${this.baseUrl}/tracks/?client_id=${this.clientId}&format=json&limit=20&tags=${encodeURIComponent(query)}`,
        { mode: 'cors' }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response:', data);

      if (!data.results || !data.results.length) {
        throw new Error('No tracks found');
      }

      return data.results.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artist_name,
        duration: track.duration,
        url: track.audio,
        imageUrl: track.image
      }));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  async playTrack(track) {
    try {
      if (this.isLoading) {
        return;
      }

      if (this.currentTrack === track.id) {
        if (this.audio.paused) {
          this.isLoading = true;
          await this.audio.play().catch(() => {});
          this.isLoading = false;
        } else {
          this.audio.pause();
        }
        return;
      }

      // Stop current track if playing
      if (!this.audio.paused) {
        this.audio.pause();
      }

      this.isLoading = true;
      this.audio.src = track.url;
      this.currentTrack = track.id;
      
      // Wait for audio to be loaded before playing
      await new Promise((resolve) => {
        const handleCanPlay = () => {
          this.audio.removeEventListener('canplay', handleCanPlay);
          resolve();
        };
        this.audio.addEventListener('canplay', handleCanPlay);
      });

      await this.audio.play().catch(() => {});
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.error('Error playing track:', error);
      throw error;
    }
  }

  pauseTrack() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  isPlaying(trackId) {
    return this.currentTrack === trackId && !this.audio.paused;
  }

  setVolume(volume) {
    if (this.audio) {
      this.audio.volume = volume;
    }
  }

  getCurrentTime() {
    return this.audio ? this.audio.currentTime : 0;
  }

  getDuration() {
    return this.audio ? this.audio.duration : 0;
  }

  seek(time) {
    if (this.audio) {
      this.audio.currentTime = time;
    }
  }
}

export default new MusicService();
