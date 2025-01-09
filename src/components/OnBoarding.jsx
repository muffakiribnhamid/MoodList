import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const OnBoarding = ({ onGetStarted }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      emoji: '🎭',
      title: 'Welcome to MoodList',
      description: 'Your personal mood-driven music companion',
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    {
      emoji: '📸',
      title: 'Detect Your Mood',
      description: 'We use AI to analyze your facial expressions in real-time',
      background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
    },
    {
      emoji: '🎵',
      title: 'Generate Playlists',
      description: 'Get personalized music recommendations based on your mood',
      background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onGetStarted();
    }
  };

  return (
    <Container background={steps[currentStep].background}>
      <FloatingIcons>
        {[...Array(12)].map((_, index) => (
          <FloatingIcon
            key={index}
            icon={index % 4}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          >
            {index % 4 === 0 ? '🎵' : index % 4 === 1 ? '🎶' : index % 4 === 2 ? '🎧' : '🎼'}
          </FloatingIcon>
        ))}
      </FloatingIcons>
      <Content>
        <StepIndicators>
          {steps.map((_, index) => (
            <StepDot key={index} active={index === currentStep} />
          ))}
        </StepIndicators>

        <MainContent>
          <EmojiContainer>
            <AnimatedEmoji>{steps[currentStep].emoji}</AnimatedEmoji>
          </EmojiContainer>

          <Title>{steps[currentStep].title}</Title>
          <Description>{steps[currentStep].description}</Description>

          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? "Let's Begin" : 'Next'}
          </Button>
        </MainContent>

        <MoodList>
          <MoodItem>
            <MoodEmoji>😊</MoodEmoji>
            <MoodText>
              <MoodTitle>Happy</MoodTitle>
              <MoodDescription>Upbeat & Energetic Tunes</MoodDescription>
            </MoodText>
          </MoodItem>
          <MoodItem>
            <MoodEmoji>😌</MoodEmoji>
            <MoodText>
              <MoodTitle>Calm</MoodTitle>
              <MoodDescription>Peaceful & Relaxing Melodies</MoodDescription>
            </MoodText>
          </MoodItem>
          <MoodItem>
            <MoodEmoji>😢</MoodEmoji>
            <MoodText>
              <MoodTitle>Sad</MoodTitle>
              <MoodDescription>Melancholic & Soulful Songs</MoodDescription>
            </MoodText>
          </MoodItem>
          <MoodItem>
            <MoodEmoji>😤</MoodEmoji>
            <MoodText>
              <MoodTitle>Angry</MoodTitle>
              <MoodDescription>Intense & Powerful Beats</MoodDescription>
            </MoodText>
          </MoodItem>
        </MoodList>
      </Content>
    </Container>
  );
};

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const floatAnimation = keyframes`
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(10px, -15px) rotate(5deg);
  }
  50% {
    transform: translate(-5px, 20px) rotate(-5deg);
  }
  75% {
    transform: translate(-15px, -5px) rotate(3deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${props => props.background};
  transition: background 0.5s ease;
  overflow: hidden;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  max-width: 1200px;
  padding: 40px 20px;
  animation: ${fadeIn} 0.6s ease-out;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const MainContent = styled.div`
  text-align: center;
  margin-bottom: 60px;
  width: 100%;
  max-width: 600px;
`;

const StepIndicators = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 60px;
`;

const StepDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.4)'};
  transition: all 0.3s ease;
`;

const EmojiContainer = styled.div`
  font-size: 96px;
  margin-bottom: 30px;
`;

const AnimatedEmoji = styled.span`
  display: inline-block;
  animation: ${float} 3s ease-in-out infinite;
`;

const Title = styled.h1`
  font-size: 48px;
  color: white;
  margin-bottom: 20px;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Description = styled.p`
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const Button = styled.button`
  background: white;
  color: #6c5ce7;
  border: none;
  padding: 16px 48px;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MoodList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1000px;
  padding: 0 20px;
`;

const MoodItem = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const MoodEmoji = styled.span`
  font-size: 32px;
  margin-right: 20px;
`;

const MoodText = styled.div`
  flex: 1;
`;

const MoodTitle = styled.h3`
  font-size: 18px;
  color: #2d3436;
  margin-bottom: 4px;
  font-weight: 600;
`;

const MoodDescription = styled.p`
  font-size: 14px;
  color: #636e72;
  margin: 0;
`;

const FloatingIcons = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.3;
`;

const FloatingIcon = styled.div`
  position: absolute;
  font-size: ${props => (props.icon === 0 ? '40px' : props.icon === 1 ? '32px' : '36px')};
  animation: ${floatAnimation} infinite linear;
  opacity: 0.4;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
  z-index: 0;
  user-select: none;
`;

export default OnBoarding;