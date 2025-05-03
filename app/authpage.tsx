import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'; // Correct import
import { auth, db } from '@/FirebaseConfig'; // Import db
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { initialUser } from '@/data/initialData'; // Import initial user data for defaults

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const signin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) router.replace('/(tabs)');
    } catch (error: any) {
      console.error("Signin error:", error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
         alert('Incorrect email or password. Please try again.');
      } else {
         alert('Sign in failed. Please try again later.');
      }
    }
  };

  const signup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      if (newUser) {
        // *** Create user document in Firestore ***
        const userDocRef = doc(db, 'users', newUser.uid);
        const initialUserDataForFirestore = {
          // Spread initial defaults, but override critical fields
          ...initialUser,
          id: newUser.uid, // Ensure ID matches auth UID
          email: newUser.email || '', // Use email from auth
          name: newUser.email?.split('@')[0] || 'New User', // Default name from email
          // Keep other initialUser fields like preferences, bio, goals etc.
        };
        // Remove id from the object being saved, as it's the document key
        delete (initialUserDataForFirestore as any).id;

        await setDoc(userDocRef, initialUserDataForFirestore);
        console.log("User document created in Firestore for UID:", newUser.uid);
        // *** End Firestore document creation ***

        router.replace('/(tabs)'); // Navigate after successful signup and doc creation
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === 'auth/email-already-in-use') {
        alert('This email address is already in use.');
      } else if (error.code === 'auth/weak-password') {
        alert('Password should be at least 6 characters.');
      } else {
        alert('Sign up failed: ' + error.message);
      }
    }
  };

  const handleAuth = () => {
      if (isLogin) {
        signin();
      } else {
        signup();
      }
  };

  const handleHomePress = () => {
      router.replace('/');  // Navigate to home screen
  };

  // Clear password state when screen is focused
  useFocusEffect(
    useCallback(() => {
      setPassword('');
    }, [])
  );

return (
<SafeAreaView style={styles.container}>
  <TouchableOpacity 
    style={styles.homeButton}
    onPress={handleHomePress}
  >
    <View style={styles.homeButtonContent}>
      <Feather name="home" size={24} color={colors.text.primary} />
      <Text style={styles.homeButtonText}>Back to Home</Text>
    </View>
  </TouchableOpacity>
  
  <View style={styles.content}>
    <Text style={styles.title}>{isLogin ? 'Login' : 'Create Account'}</Text>
    
    <TextInput
      placeholder="Email"
      value={email}
      onChangeText={setEmail}
      style={styles.input}
      autoCapitalize="none"
      keyboardType="email-address"
    />
    
    <View style={styles.passwordContainer}>
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={[styles.input, styles.passwordInput]}
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity 
        style={styles.eyeButton}
        onPress={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <Feather name="eye" size={24} color={colors.text.secondary} />
        ) : (
          <Feather name="eye-off" size={24} color={colors.text.secondary} />
        )}
      </TouchableOpacity>
    </View>
    
    <TouchableOpacity style={styles.button} onPress={handleAuth}>
      <Text style={styles.buttonText}>
        {isLogin ? 'Sign In' : 'Sign Up'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={styles.switchButton} 
      onPress={() => setIsLogin(!isLogin)}
    >
      <Text style={styles.switchText}>
        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
      </Text>
    </TouchableOpacity>
  </View>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: colors.background,
},
homeButton: {
  position: 'absolute',
  top: spacing.xlarge + 40, // Increased to lower the button
  left: spacing.large,
  zIndex: 1,
  padding: spacing.small,
  backgroundColor: colors.cardAlt,
  borderRadius: 8,
},
homeButtonContent: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.xsmall,
},
homeButtonText: {
  ...typography.button,
  color: colors.text.primary,
  marginLeft: spacing.xsmall,
},
content: {
  flex: 1,
  justifyContent: 'center',
  padding: spacing.large,
  paddingTop: spacing.xlarge + 80, // Increased top padding to account for larger header
},
title: {
  ...typography.h1,
  textAlign: 'center',
  marginBottom: spacing.xlarge,
},
input: {
  backgroundColor: colors.cardAlt,
  padding: spacing.medium,
  borderRadius: 8,
  marginBottom: spacing.medium,
  ...typography.body,
},
button: {
  backgroundColor: colors.primary,
  padding: spacing.medium,
  borderRadius: 8,
  alignItems: 'center',
  marginTop: spacing.medium,
},
buttonText: {
  ...typography.button,
  color: colors.white,
},
switchButton: {
  marginTop: spacing.large,
  alignItems: 'center',
},
switchText: {
  ...typography.body,
  color: colors.primary,
},
passwordContainer: {
  position: 'relative',
  width: '100%',
  marginBottom: spacing.medium,
},
passwordInput: {
  paddingRight: 50, // Make room for the eye icon
},
eyeButton: {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: [{ translateY: -12 }],
},
});