import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import styled from 'styled-components';
import { useMoodContext } from '../context/useContext';
import Loading from './Loading';
import MusicPlayer from './MusicPlayer';

const MoodTrackers = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClicked,setIsClicked] = useState(false)
  const { currentMood, updateMood } = useMoodContext();

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Use local model files from public/models directory
        const MODEL_URL = '/models';
        
        await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
        console.log('Face detector loaded');
        await faceapi.loadFaceExpressionModel(MODEL_URL);
        console.log('Expression model loaded');

        startVideo();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading models:', error);
        setError('Failed to load face detection models');
        setIsLoading(false);
      }
    };

    loadModels();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Error accessing camera:", err);
        setError('Failed to access camera');
        setIsLoading(false);
      });
  };

  const handleCapture = () => {
    alert(`Current Mood: ${capitalizeFirstLetter(currentMood.mood)}
Confidence: ${Math.round(currentMood.confidence * 100)}%
Time: ${new Date(currentMood.timestamp).toLocaleTimeString()}`);
  };

  useEffect(() => {
    let interval;

    const detectMood = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      try {
        const detections = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
          )
          .withFaceExpressions();

        if (detections) {
          const expressions = detections.expressions;
          const strongestEmotion = Object.entries(expressions)
            .filter(([_, value]) => value > 0.5)
            .sort(([, a], [, b]) => b - a)[0];

          if (strongestEmotion) {
            const [newMood, confidence] = strongestEmotion;
            if (newMood !== currentMood.mood) {
              updateMood(newMood, confidence);
            }
          }
        }
      } catch (error) {
        console.error('Error in mood detection:', error);
      }
    };

    if (!isLoading && videoRef.current) {
      interval = setInterval(detectMood, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, currentMood.mood, updateMood]);

  const getMoodEmoji = (mood) => {
    const emojis = {
      neutral: '😐',
      happy: '😊',
      sad: '😢',
      angry: '😠',
      fearful: '😨',
      disgusted: '🤢',
      surprised: '😲'
    };
    return emojis[mood] || '😐';
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if(isClicked) {
    return(
    <MusicPlayer/>
)    
}

  return (
    <Container>
      <Title>Let's Track Your Mood</Title>
      {error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : isLoading ? (
        <LoadingText>Loading face detection models...</LoadingText>
      ) : (
        <>
          <VideoContainer>
            <Video
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />
            <Canvas ref={canvasRef} />
            <CurrentMoodDisplay>
              <MoodEmoji>{getMoodEmoji(currentMood.mood)}</MoodEmoji>
              <MoodLabel>{capitalizeFirstLetter(currentMood.mood)}</MoodLabel>
            </CurrentMoodDisplay>
          </VideoContainer>
          <CaptureButton onClick={() => setIsClicked(true)}>
            <CaptureIcon>📸</CaptureIcon>
            Capture Mood
          </CaptureButton>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  font-size: 2.5rem;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 640px;
  height: 480px;
  background: black;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
`;

const CurrentMoodDisplay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const MoodEmoji = styled.span`
  font-size: 2rem;
`;

const MoodLabel = styled.span`
  font-size: 1.2rem;
  color: #333;
  font-weight: bold;
`;

const LoadingText = styled.div`
  font-size: 1.5rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 1.2rem;
  text-align: center;
`;

const CaptureButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 12px 24px;
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  background: #6c5ce7;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(108, 92, 231, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(108, 92, 231, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CaptureIcon = styled.span`
  font-size: 1.4rem;
`;

export default MoodTrackers;