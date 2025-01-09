import React from 'react';
import MoodTrackers from './components/MoodTrackers';
import OnBoarding from './components/OnBoarding';
import styled, { createGlobalStyle } from 'styled-components';
import { MoodProvider, useMoodContext } from './context/useContext';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Loading from './components/Loading';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`;

const AppContent = () => {
  const { isOnboardingCompleted, completeOnboarding } = useMoodContext();

  return (
    <AppContainer>
      {!isOnboardingCompleted ? (
        <OnBoarding onGetStarted={completeOnboarding} />
      ) : (
        <MoodTrackers />
      )}
    </AppContainer>
  );
};

function App() {
  return (
    <MoodProvider>
      <GlobalStyle />
      <AppContent />
    </MoodProvider>
  );
}

const AppContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
`;

export default App;
