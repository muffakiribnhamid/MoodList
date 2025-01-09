import React, { createContext, useContext, useState, useEffect } from 'react';

const MoodContext = createContext();

export const useMoodContext = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMoodContext must be used within a MoodProvider');
  }
  return context;
};

export const MoodProvider = ({ children }) => {
  // Get initial onboarding state from localStorage or default to false
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(() => {
    const saved = localStorage.getItem('onboardingCompleted');
    return saved ? JSON.parse(saved) : false;
  });

  const [currentMood, setCurrentMood] = useState({
    mood: 'neutral',
    confidence: 0,
    timestamp: null
  });

  // Save onboarding state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('onboardingCompleted', JSON.stringify(isOnboardingCompleted));
  }, [isOnboardingCompleted]);

  const completeOnboarding = () => {
    setIsOnboardingCompleted(true);
  };

  const updateMood = (mood, confidence) => {
    setCurrentMood({
      mood,
      confidence,
      timestamp: new Date().toISOString()
    });
  };

  const value = {
    isOnboardingCompleted,
    completeOnboarding,
    currentMood,
    updateMood
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
};

export default MoodProvider;