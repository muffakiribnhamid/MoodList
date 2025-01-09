import React from 'react';
import styled, { keyframes } from 'styled-components';

const Loading = ({ message }) => {
  return (
    <LoadingContainer>
      <LoadingWrapper>
        <LoadingAnimation>
          <WaveformAnimation>
            <Bar delay="0s" />
            <Bar delay="0.2s" />
            <Bar delay="0.4s" />
            <Bar delay="0.6s" />
            <Bar delay="0.8s" />
          </WaveformAnimation>
        </LoadingAnimation>
        <LoadingMessage>{message || 'Loading...'}</LoadingMessage>
      </LoadingWrapper>
    </LoadingContainer>
  );
};

const waveform = keyframes`
  0% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
  100% { transform: scaleY(0.3); }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
`;

const LoadingAnimation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100px;
`;

const WaveformAnimation = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 60px;
`;

const Bar = styled.div`
  width: 4px;
  height: 100%;
  background: #1db954;
  border-radius: 2px;
  animation: ${waveform} 1s ease-in-out infinite;
  animation-delay: ${props => props.delay};
  transform-origin: bottom;
`;

const LoadingMessage = styled.div`
  color: white;
  font-size: 1.5rem;
  font-weight: 500;
  text-align: center;
  opacity: 0.9;
`;

export default Loading;