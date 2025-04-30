import React from 'react';
import { StatusBar, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
    </NavigationContainer>
  );
}