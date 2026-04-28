import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, shadow } from '../theme/tokens';

export default function GlobalChatButton({ navigationRef, currentRouteName }) {
  // Don't show on certain screens like Splash, Login, Signup or Chatbot itself
  const hideOn = ['Splash', 'Onboarding', 'Login', 'Signup', 'Chatbot', 'SplashAnimation'];
  if (hideOn.includes(currentRouteName)) return null;

  const handlePress = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Chatbot');
    }
  };

  return (
    <TouchableOpacity 
      style={styles.fab} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons name="chatbubbles" size={28} color="#FFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'web' ? 20 : 90, // Higher on mobile to avoid tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.lg,
    zIndex: 9999,
  },
});
