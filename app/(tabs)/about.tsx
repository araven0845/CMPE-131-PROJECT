import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import React, { useState } from 'react';
import Button from '@/components/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export default function AboutScreen() {
  const { signout,user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Name');
  const [weight, setWeight] = useState('');
  const [goals, setGoals] = useState('');
  const [dob, setDob] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Function to launch image picker for updating profile picture
  const pickImage = async () => {
    // Request media library permissions for non-web platforms
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need permission to access your photos to update the profile picture.'
        );
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      // Access the URI from the assets array
      setProfilePicture(result.assets[0].uri);
    }
  };

  // Save changes: This is where you might call your backend API
  const handleSave = () => {
    Alert.alert('Profile Updated', 'Your profile details have been saved.');
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.footerContainer}>
        <Text style={styles.text}>Welcome, {user.name}</Text>
      </View>

      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={isEditing ? pickImage : undefined}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
          ) : (
            <View style={[styles.profilePicture, styles.placeholder]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          {isEditing && (
            <View style={styles.editOverlay}>
              <Text style={styles.editOverlayText}>Edit Picture</Text>
            </View>
          )}
        </TouchableOpacity>
        {isEditing ? (
          <TextInput
            style={[styles.input, styles.nameInput]}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#888"
          />
        ) : (
          <Text style={styles.profileText}>{user.name}</Text>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Weight (lbs):</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="Weight (lbs)"
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
        ) : (
          <Text style={styles.infoText}>{weight} </Text>
        )}

        <Text style={styles.label}>Goals:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={goals}
            onChangeText={setGoals}
            placeholder="Goals"
            placeholderTextColor="#888"
          />
        ) : (
          <Text style={styles.infoText}>{goals}</Text>
        )}

        <Text style={styles.label}>Date of Birth (MM-DD-YYY):</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={setDob}
            placeholder="MM-DD-YYYY"
            placeholderTextColor="#888"
          />
        ) : (
          <Text style={styles.infoText}>{dob}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          if (isEditing) {
            handleSave();
          } else {
            setIsEditing(true);
          }
        }}
      >
        <Text style={styles.buttonText}>{isEditing ? 'Save' : 'Edit Profile'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={signout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
  footerContainer: {
    flex: 1/2,
    alignItems: "center",
  },
  button: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholder: {
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#ccc',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    width: 120,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    paddingVertical: 4,
  },
  editOverlayText: {
    color: '#fff',
    fontSize: 12,
  },
  profileText: {
    color: '#fff',
    fontSize: 20,
    marginVertical: 10,
  },
  nameInput: {
    marginVertical: 10,
    textAlign: 'center',
    fontSize: 20,
  },
  infoContainer: {
    width: '100%',
    marginVertical: 20,
  },
  label: {
    color: '#aaa',
    marginTop: 10,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 4,
  },
  input: {
    backgroundColor: '#444',
    color: '#fff',
    width: '100%',
    height: 40,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginVertical: 4,
  },
  editButton: {
    backgroundColor: '#6fa8dc',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginVertical: 20,
  },
});
