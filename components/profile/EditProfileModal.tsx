import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Modal, Pressable } from 'react-native';
import { X, Plus, Camera, User } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { EditProfileFormData } from '@/types/user';
import * as ImagePicker from 'expo-image-picker';

interface EditProfileModalProps {
  initialData: EditProfileFormData;
  onClose: () => void;
  onSave: (data: EditProfileFormData) => void;
  useMetric: boolean;
}

export default function EditProfileModal({
  initialData,
  onClose,
  onSave,
  useMetric,
}: EditProfileModalProps) {
  // Local form state
  const [formData, setFormData] = useState<EditProfileFormData>(initialData);

  // For imperial mode: split height into feet/inches.
  // For metric mode, we use the height value directly.
  const initialFeet = !useMetric && initialData.height ? Math.floor(initialData.height / 12).toString() : '';
  const initialInches = !useMetric && initialData.height ? (initialData.height % 12).toString() : '';
  
  const [feet, setFeet] = useState(initialFeet);
  const [inches, setInches] = useState(initialInches);
  const [newGoal, setNewGoal] = useState('');

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()],
      }));
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));
  };

  const handleImageSelect = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access photo library is required!');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    
    if (!result.canceled) {
      setFormData(prev => ({
        ...prev,
        profileImage: result.assets[0].uri,
      }));
    }
  };

  const handleSave = () => {
    let newHeight = formData.height || 0;
    let newWeight = formData.weight || 0;

    if (!useMetric) {
      // Combine feet and inches into total inches for imperial mode.
      const parsedFeet = parseInt(feet) || 0;
      const parsedInches = parseInt(inches) || 0;
      newHeight = parsedFeet * 12 + parsedInches;
    }
    // In metric mode, formData.height is assumed entered in cm and weight in kg

    onSave({ ...formData, height: newHeight, weight: newWeight });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackground} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.imageSection}>
              <TouchableOpacity style={styles.imageContainer} onPress={handleImageSelect}>
                {formData.profileImage ? (
                  <Image source={{ uri: formData.profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <User size={40} color={colors.text.secondary} />
                  </View>
                )}
                <View style={styles.cameraButton}>
                  <Camera size={20} color={colors.white} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Your name"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                placeholder="Tell us about yourself"
                multiline
              />
            </View>

            {useMetric ? (
              <>
                <View style={styles.section}>
                  <Text style={styles.label}>Height (cm)</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text.secondary }]}
                    value={formData.height ? formData.height.toString() : ''}
                    onChangeText={(text) =>
                      setFormData(prev => ({ ...prev, height: parseInt(text) || 0 }))
                    }
                    placeholder="Enter height in cm"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text.secondary }]}
                    value={formData.weight ? formData.weight.toString() : ''}
                    onChangeText={(text) =>
                      setFormData(prev => ({ ...prev, weight: parseInt(text) || 0 }))
                    }
                    placeholder="Enter weight in kg"
                    keyboardType="numeric"
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.label}>Height</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginRight: spacing.small, color: colors.text.secondary }]}
                      value={feet}
                      onChangeText={setFeet}
                      placeholder="Feet"
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.input, { flex: 1, color: colors.text.secondary }]}
                      value={inches}
                      onChangeText={setInches}
                      placeholder="Inches"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Weight (lbs)</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text.secondary }]}
                    value={formData.weight ? formData.weight.toString() : ''}
                    onChangeText={(text) =>
                      setFormData(prev => ({ ...prev, weight: parseInt(text) || 0 }))
                    }
                    placeholder="Enter weight in lbs"
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}

            <View style={styles.section}>
              <Text style={styles.label}>Fitness Goals</Text>
              <View style={styles.goalsList}>
                {formData.goals.map((goal, index) => (
                  <View key={index} style={styles.goalItem}>
                    <Text style={styles.goalText}>{goal}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveGoal(index)}
                      style={styles.removeGoalButton}
                    >
                      <X size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View style={styles.addGoalContainer}>
                <TextInput
                  style={[styles.input, styles.addGoalInput]}
                  value={newGoal}
                  onChangeText={setNewGoal}
                  placeholder="Add new goal"
                />
                <TouchableOpacity
                  style={styles.addGoalButton}
                  onPress={handleAddGoal}
                >
                  <Plus size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    height: '80%',
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addGoalInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.medium,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  title: {
    ...typography.h2,
  },
  closeButton: {
    padding: spacing.small,
  },
  content: {
    flex: 1,
    padding: spacing.large,
    backgroundColor: colors.background,
  },
  imageSection: {
    alignItems: 'center',
    padding: spacing.large,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  section: {
    paddingVertical: spacing.large,
  },
  label: {
    ...typography.bodyBold,
    marginBottom: spacing.small,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.medium,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  goalsList: {
    marginBottom: spacing.medium,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.medium,
    marginBottom: spacing.small,
  },
  goalText: {
    ...typography.body,
    flex: 1,
  },
  removeGoalButton: {
    padding: spacing.small,
  },
  addGoalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addGoalButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.large,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    marginRight: spacing.medium,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  saveButton: {
    flex: 1,
    padding: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },
});