import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaHeart, FaGithub, FaArrowLeft } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useMoodContext } from '../context/useContext';
import musicService from '../services/musicService';
import Loading from './Loading';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const progressRef = useRef(null);

  const { currentMood } = useMoodContext();

  useEffect(() => {
    const loadTracks = async () => {
      if (currentMood?.mood) {
        try {
          setIsLoading(true);
          const recommendations = await musicService.getRecommendations(currentMood.mood);
          setTracks(recommendations);
          if (recommendations.length > 0) {
            setCurrentTrack(recommendations[0]);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadTracks();
  }, [currentMood?.mood]);

  useEffect(() => {
    let timeUpdateInterval;
    if (isPlaying) {
      timeUpdateInterval = setInterval(() => {
        setCurrentTime(musicService.getCurrentTime());
      }, 1000);
    }
    return () => clearInterval(timeUpdateInterval);
  }, [isPlaying]);

  useEffect(() => {
    // Check if current track is in favorites
    const favoriteTracks = JSON.parse(localStorage.getItem('favoriteTracks') || '[]');
    if (currentTrack) {
      setIsLiked(favoriteTracks.some(track => track.id === currentTrack.id));
    }
  }, [currentTrack]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const recommendations = await musicService.getRecommendations(currentMood);
      setTracks(recommendations);
      if (recommendations.length > 0) {
        setCurrentTrack(recommendations[0]);
        setCurrentTrackIndex(0);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgressClick = (e) => {
    if (progressRef.current && currentTrack) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const duration = musicService.getDuration();
      const newTime = (x / width) * duration;
      musicService.seek(newTime);
      setCurrentTime(newTime);
    }
  };

  const togglePlay = async () => {
    if (!currentTrack) return;
    
    try {
      setIsLoadingTrack(true);
      await musicService.playTrack(currentTrack);
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
      setError(error.message);
    } finally {
      setIsLoadingTrack(false);
    }
  };

  const handleNextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    setCurrentTrack(tracks[nextIndex]);
    if (isPlaying) {
      musicService.playTrack(tracks[nextIndex]);
    }
  };

  const handlePrevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIndex);
    setCurrentTrack(tracks[prevIndex]);
    if (isPlaying) {
      musicService.playTrack(tracks[prevIndex]);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    musicService.setVolume(newVolume);
  };

  const toggleLike = () => {
    if (!currentTrack) return;

    const favoriteTracks = JSON.parse(localStorage.getItem('favoriteTracks') || '[]');
    let updatedFavorites;

    if (isLiked) {
      updatedFavorites = favoriteTracks.filter(track => track.id !== currentTrack.id);
    } else {
      updatedFavorites = [...favoriteTracks, {
        id: currentTrack.id,
        name: currentTrack.name,
        artist: currentTrack.artist,
        imageUrl: currentTrack.imageUrl,
        audioUrl: currentTrack.audioUrl
      }];
    }

    localStorage.setItem('favoriteTracks', JSON.stringify(updatedFavorites));
    setIsLiked(!isLiked);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    setShowMoodTracker(true);
  };

  const viewFavorites = () => {
    const favoriteTracks = JSON.parse(localStorage.getItem('favoriteTracks') || '[]');
    alert(
      favoriteTracks.length > 0
        ? 'Your Favorite Songs:\n\n' + 
          favoriteTracks.map(track => `${track.name} - ${track.artist}`).join('\n')
        : 'No favorite songs yet!'
    );
  };

  if (showMoodTracker) {
    window.location.reload();
    return null;
  }

  if (isLoading) {
    return <Loading message="Detecting your mood..." />;
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorMessage>
          <ErrorIcon>❌</ErrorIcon>
          <ErrorText>{error}</ErrorText>
        </ErrorMessage>
      </ErrorContainer>
    );
  }

  return (
    <PlayerContainer>
      <BackButton onClick={handleBack}>
        <FaArrowLeft />
      </BackButton>
      <MainPlayer>
        <MoodHeader>
          <MoodTitle>Current Mood: <MoodValue>{currentMood?.mood || 'neutral'}</MoodValue></MoodTitle>
          <MoodEmoji>
            {currentMood?.mood === 'happy' && '😊'}
            {currentMood?.mood === 'sad' && '😢'}
            {currentMood?.mood === 'energetic' && '⚡'}
            {currentMood?.mood === 'calm' && '😌'}
            {(!currentMood?.mood || currentMood?.mood === 'neutral') && '😐'}
          </MoodEmoji>
        </MoodHeader>

        <NowPlaying>
          {currentTrack ? (
            <AlbumArt>
              <img src={currentTrack.imageUrl} alt={currentTrack.name} />
            </AlbumArt>
          ) : (
            <LoadingTrack>
              <WaveformAnimation>
                <Bar delay="0s" />
                <Bar delay="0.2s" />
                <Bar delay="0.4s" />
                <Bar delay="0.6s" />
                <Bar delay="0.8s" />
              </WaveformAnimation>
              <LoadingText>Loading track...</LoadingText>
            </LoadingTrack>
          )}
          <TrackInfo>
            <TrackTitle>{currentTrack?.name}</TrackTitle>
            <ArtistName>{currentTrack?.artist}</ArtistName>
          </TrackInfo>
        </NowPlaying>

        <Controls>
          <ControlButton onClick={handlePrevTrack}><FaStepBackward /></ControlButton>
          <PlayButton onClick={togglePlay} disabled={isLoadingTrack}>
            {isLoadingTrack ? (
              <LoadingIcon />
            ) : isPlaying ? (
              <FaPause />
            ) : (
              <FaPlay />
            )}
          </PlayButton>
          <ControlButton onClick={handleNextTrack}><FaStepForward /></ControlButton>
        </Controls>

        <ProgressContainer>
          <TimeInfo>
            <TimeText>{formatTime(currentTime)}</TimeText>
            <TimeText>{formatTime(currentTrack?.duration || 0)}</TimeText>
          </TimeInfo>
          <ProgressBar ref={progressRef} onClick={handleProgressClick}>
            <Progress style={{ width: `${(currentTime / (currentTrack?.duration || 1)) * 100}%` }} />
          </ProgressBar>
        </ProgressContainer>

        <VolumeContainer>
          <FaVolumeUp />
          <VolumeSlider
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          />
        </VolumeContainer>

        <AdditionalControls>
          <IconButton onClick={toggleLike} active={isLiked}>
            <FaHeart />
          </IconButton>
          <IconButton as="a" href="https://github.com/muffakiribnhamid" target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </IconButton>
        </AdditionalControls>
      </MainPlayer>
    </PlayerContainer>
  );
};

const waveform = keyframes`
  0% { height: 10px; }
  50% { height: 40px; }
  100% { height: 10px; }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const PlayerContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #1e1e1e, #121212);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem 2rem;
  position: relative;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    padding: 3rem 1rem 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 2.5rem 0.5rem 0.5rem;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;
  
  @media (max-width: 768px) {
    top: 15px;
    left: 15px;
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    top: 10px;
    left: 10px;
    font-size: 1.2rem;
  }
`;

const MainPlayer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    padding: 10px;
    gap: 1rem;
  }
`;

const NowPlaying = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const AlbumArt = styled.div`
  width: 300px;
  height: 300px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    width: 250px;
    height: 250px;
  }
  
  @media (max-width: 480px) {
    width: 200px;
    height: 200px;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TrackInfo = styled.div`
  width: 100%;
  text-align: center;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const TrackTitle = styled.h2`
  font-size: 1.8rem;
  margin: 0;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const ArtistName = styled.h3`
  font-size: 1.2rem;
  color: #b3b3b3;
  margin: 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Controls = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin: 1rem 0;
  
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    padding: 0.4rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
    padding: 0.3rem;
  }
`;

const PlayButton = styled(ControlButton)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.disabled ? '#165e32' : '#1db954'};
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.7 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.1)'};
    background: ${props => props.disabled ? '#165e32' : '#1ed760'};
  }

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 1.8rem;
  }

  @media (max-width: 480px) {
    width: 45px;
    height: 45px;
    font-size: 1.5rem;
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  max-width: 600px;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const TimeInfo = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  color: #b3b3b3;
  font-size: 0.9rem;
  margin-bottom: 5px;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const TimeText = styled.span`
  color: #b3b3b3;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 5px;
  background: #4f4f4f;
  border-radius: 2.5px;
  cursor: pointer;
  position: relative;
  
  @media (max-width: 480px) {
    height: 4px;
  }
`;

const Progress = styled.div`
  height: 100%;
  background: #1DB954;
  border-radius: 2.5px;
  width: ${props => (props.progress || 0)}%;
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
  
  @media (max-width: 480px) {
    display: none; /* Hide volume control on mobile */
  }
`;

const VolumeSlider = styled.input`
  width: 100px;
  
  @media (max-width: 768px) {
    width: 80px;
  }
`;

const AdditionalControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.8rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.active ? '#1DB954' : 'white'};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    padding: 0.4rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    padding: 0.3rem;
  }
`;

const MoodHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  
  @media (max-width: 768px) {
    padding: 0.8rem;
    gap: 0.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem;
    gap: 0.5rem;
    flex-direction: column;
  }
`;

const MoodTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: white;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const MoodValue = styled.span`
  color: #1db954;
  text-transform: capitalize;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const MoodEmoji = styled.span`
  font-size: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const LoadingTrack = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LoadingText = styled.div`
  color: #b3b3b3;
  font-size: 1rem;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ErrorText = styled.div`
  color: white;
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 400px;
  text-align: center;
  margin: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin: 1.5rem;
    max-width: 300px;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin: 1rem;
    max-width: 250px;
  }
`;

const LoadingIcon = styled(AiOutlineLoading3Quarters)`
  animation: ${rotate} 1s linear infinite;
  font-size: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const WaveformAnimation = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
`;

const Bar = styled.div`
  width: 3px;
  height: 100%;
  background: #1db954;
  border-radius: 2px;
  animation: ${waveform} 1s ease-in-out infinite;
  animation-delay: ${props => props.delay};
  transform-origin: bottom;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
  padding: 2rem;
`;

const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
`;

export default MusicPlayer;