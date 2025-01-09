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
      <Nav>
        <NavLeft>
          <NavButton onClick={handleBack}>
            <FaArrowLeft /> Back
          </NavButton>
        </NavLeft>
        <NavCenter>
          <NavTitle>MoodList</NavTitle>
        </NavCenter>
        <NavRight>
          <NavButton onClick={viewFavorites}>
            <FaHeart /> Favorites
          </NavButton>
          <NavButton as="a" href="https://github.com/muffakiribnhamid" target="_blank" rel="noopener noreferrer">
            <FaGithub /> GitHub
          </NavButton>
        </NavRight>
      </Nav>

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
            <>
              <AlbumArt src={currentTrack.imageUrl} alt={currentTrack.name} />
              <TrackInfo>
                <TrackName>{currentTrack.name}</TrackName>
                <ArtistName>{currentTrack.artist}</ArtistName>
              </TrackInfo>
            </>
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
          <TimeText>{formatTime(currentTime)}</TimeText>
          <ProgressBar ref={progressRef} onClick={handleProgressClick}>
            <Progress style={{ width: `${(currentTime / (currentTrack?.duration || 1)) * 100}%` }} />
          </ProgressBar>
          <TimeText>{formatTime(currentTrack?.duration || 0)}</TimeText>
        </ProgressContainer>

        <VolumeControl>
          <FaVolumeUp />
          <VolumeSlider
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          />
        </VolumeControl>

        <LikeButton onClick={toggleLike} isLiked={isLiked}>
          <FaHeart />
        </LikeButton>
      </MainPlayer>

      <QueueContainer>
        <QueueTitle>Next Up</QueueTitle>
        <QueueList>
          {tracks.map((track, index) => (
            <QueueItem 
              key={track.id}
              isActive={index === currentTrackIndex}
              onClick={() => {
                setCurrentTrackIndex(index);
                setCurrentTrack(track);
                musicService.playTrack(track);
                setIsPlaying(true);
              }}
            >
              <QueueItemImage src={track.imageUrl} alt={track.name} />
              <QueueItemInfo>
                <QueueItemName>{track.name}</QueueItemName>
                <QueueItemArtist>{track.artist}</QueueItemArtist>
              </QueueItemInfo>
            </QueueItem>
          ))}
        </QueueList>
      </QueueContainer>
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
  display: flex;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
  min-height: 100vh;
  color: white;
`;

const MainPlayer = styled.div`
  flex: 2;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const QueueContainer = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
`;

const NowPlaying = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const AlbumArt = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 10px;
  object-fit: cover;
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TrackName = styled.h2`
  font-size: 1.5rem;
  margin: 0;
`;

const ArtistName = styled.h3`
  font-size: 1rem;
  color: #888;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const PlayButton = styled(ControlButton)`
  font-size: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.disabled ? '#165e32' : '#1db954'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.7 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

  &:hover {
    background: ${props => props.disabled ? '#165e32' : '#1ed760'};
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
`;

const Progress = styled.div`
  height: 100%;
  background: #1db954;
  border-radius: 2px;
  position: absolute;
`;

const TimeText = styled.span`
  font-size: 0.8rem;
  color: #888;
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const VolumeSlider = styled.input`
  width: 100px;
  accent-color: #1db954;
`;

const LikeButton = styled(ControlButton)`
  color: ${props => props.isLiked ? '#1db954' : 'white'};
`;

const QueueTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const QueueList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
`;

const QueueItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: 10px;
  cursor: pointer;
  background: ${props => props.isActive ? 'rgba(29, 185, 84, 0.1)' : 'transparent'};
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const QueueItemImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 5px;
  object-fit: cover;
`;

const QueueItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const QueueItemName = styled.span`
  font-size: 0.9rem;
`;

const QueueItemArtist = styled.span`
  font-size: 0.8rem;
  color: #888;
`;

const LoadingTrack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  min-height: 200px;
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

const LoadingText = styled.div`
  color: #888;
  font-size: 1rem;
  text-align: center;
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

const ErrorText = styled.div`
  color: white;
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 400px;
`;

const LoadingIcon = styled(AiOutlineLoading3Quarters)`
  animation: ${rotate} 1s linear infinite;
`;

const MoodHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
`;

const MoodTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: white;
`;

const MoodValue = styled.span`
  color: #1db954;
  text-transform: capitalize;
`;

const MoodEmoji = styled.span`
  font-size: 2rem;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  margin-bottom: 2rem;
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NavCenter = styled.div``;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.3s ease;
  text-decoration: none;

  &:hover {
    color: #1db954;
  }
`;

const NavTitle = styled.h1`
  color: white;
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
`;

export default MusicPlayer;