import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Switch, TextInput, Modal } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { UserContext } from '@/context/UserContext';
import { WorkoutContext } from '@/context/WorkoutContext';
import PersonalRecordCard from '@/components/profile/PersonalRecordCard';
import StatsCard from '@/components/profile/StatsCard';
import SettingsItem from '@/components/profile/SettingsItem';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { EditProfileFormData } from '@/types/user';
import { useEffect } from 'react';
import { auth, db } from '@/FirebaseConfig';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUser, updateUserPreference, loading } = useContext(UserContext);
  const { workoutHistory, personalRecords } = useContext(WorkoutContext);
  const [editMode, setEditMode] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Use a default value or conditional to handle potential null user
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [restTimeSeconds, setRestTimeSeconds] = useState(
    (user?.preferences?.defaultRestTime || 0).toString()
  );

  const handleRestTimeChange = (text: string) => {
    // Allow empty string during typing
    setRestTimeSeconds(text);
  };

  const handleSave = () => {
    // Convert empty string to 0, otherwise parse the number (with 0 fallback)
    const parsedRestTime = restTimeSeconds === '' ? 0 : parseInt(restTimeSeconds, 10) || 0;
    
    // Update preferences in user data with the parsed value
    if (user) {
      updateUser({
        ...user,
        preferences: {
          ...user.preferences,
          defaultRestTime: parsedRestTime,
          // other preference fields...
        }
      });
    }
    
    setShowRestTimerModal(false); // Close the modal when done
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Update selectedRestTime when user data loads
  useEffect(() => {
    if (user?.preferences?.defaultRestTime) {
      setRestTimeSeconds(user.preferences.defaultRestTime.toString());
    }
  }, [user?.preferences?.defaultRestTime]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/authpage');
      }
    });
    return () => unsubscribe();
  }, []);

  // Use this effect to check authentication
  useEffect(() => {
    // Only redirect if not loading and no user
    if (!loading && !user) {
      router.replace('/authpage');
    }
  }, [user, loading]);

  const toggleUnitPreference = () => {
    const newUseMetric = user ? !user.preferences.useMetric : false;
    let newHeight = user?.height ?? 0;
    let newWeight = user?.weight ?? 0;

    if (newUseMetric) {
      // Converting from Imperial (inches, lbs) to Metric (cm, kg)
      newHeight = Math.round(((user?.height ?? 0) * 2.54));
      newWeight = Math.round(((user?.weight ?? 0) / 2.20462));
    } else {
      // Converting from Metric to Imperial
      newHeight = Math.round((user?.height ?? 0) / 2.54);
      newWeight = Math.round((user?.weight ?? 0) * 2.20462);
    }

    // Update both the user's height/weight and the metric preference
    updateUser({ ...user, height: newHeight, weight: newWeight });
    updateUserPreference('useMetric', newUseMetric);
  };

  const toggleNotifications = () => {
    if (user) {
      updateUserPreference('notifications', !user.preferences.notifications);
    }
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleSaveProfile = (data: EditProfileFormData) => {
    updateUser({
      ...user,
      name: data.name,
      bio: data.bio,
      goals: data.goals,
      height: data.height,
      weight: data.weight,
      // Use null instead of undefined if no profile image
      profileImage: data.profileImage,
    });
    setShowEditProfile(false);
  };

  const handleChangePassword = async () => {
    try {
      const user = auth.currentUser;

      if (user) {
        // Reauthenticate the user
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update the password
        await updatePassword(user, newPassword);

        // Sign out the user
        await auth.signOut();
        router.replace('/authpage');
        alert('Password changed successfully. Please log in with your new password.');
      } else {
        alert('No user is currently signed in.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'auth/wrong-password') {
        alert('The current password you entered is incorrect.');
      } else {
        alert('Failed to change password. Please try again.');
      }
    } finally {
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  // Show loading state while user data is loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If not loading and no user, redirect happens in the effect above
  // But still return null until the redirect happens
  if (!user) return null;

  // Calculate workout statistics from workoutHistory
  const totalWorkouts = workoutHistory.length;
  const totalWorkoutTime = workoutHistory.reduce((sum, workout) => sum + (workout.duration || 0), 0);
  const averageWorkoutTime = totalWorkouts > 0 ? Math.floor(totalWorkoutTime / totalWorkouts / 60) : 0;
  
  // Calculate current streak
  const calculateStreak = () => {
    if (workoutHistory.length === 0) return 0;
    
    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    // Get current date at midnight for consistent comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    
    // Create a set of days with workouts
    const workoutDays = new Set();
    workoutHistory.forEach(workout => {
      const date = new Date(workout.date);
      date.setHours(0, 0, 0, 0);
      workoutDays.add(date.getTime());
    });
    
    // Count consecutive days with workouts, starting from today and going backwards
    let streak = 0;
    for (let i = 0; i < 60; i++) { // Check up to 60 days back
      const checkDate = new Date(todayMs - i * DAY_IN_MS);
      if (workoutDays.has(checkDate.getTime())) {
        streak++;
      } else if (streak > 0) {
        // Break once the streak is broken
        break;
      }
    }
    
    return streak;
  };
  
  const currentStreak = calculateStreak();
  
  const formatHeight = (height: number): string => {
    // Assume height is stored in inches when using Imperial
    const feet = Math.floor(height / 12);
    const inches = height % 12;
    return `${feet}'${inches}"`;
  };

  const displayedHeight = user.height
    ? user.preferences.useMetric
      ? `${user.height} cm`
      : formatHeight(user.height)
    : '';

  const displayedWeight = user.weight
    ? user.preferences.useMetric
      ? `${user.weight} kg`
      : `${user.weight} lbs`
    : '';

  // Convert personal records based on unit preference
  const displayedStrengthRecords = personalRecords.map(record => {
    // Handle zero values based on user's unit preference
    if (record.value === '0 kg' || record.value === '0 lbs') {
      return { 
        ...record, 
        value: user.preferences.useMetric ? '0 kg' : '0 lbs' 
      };
    }
    
    // Handle non-zero values
    if (!user.preferences.useMetric && record.value.includes('kg')) {
      const match = record.value.match(/(\d+(\.\d+)?)\s*kg/);
      if (match) {
        const kg = parseFloat(match[1]); 
        const lbs = Math.round(kg * 2.20462);
        return { ...record, value: `${lbs} lbs` };
      }
    }
    else if (user.preferences.useMetric && record.value.includes('lbs')) {
      const match = record.value.match(/(\d+(\.\d+)?)\s*lbs/);
      if (match) {
        const lbs = parseFloat(match[1]);
        const kg = Math.round(lbs / 2.20462);
        return { ...record, value: `${kg} kg` };
      }
    }
    return record;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Profile</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <Text style={styles.doneText}>Done</Text>
            ) : (
              <Feather name="settings" size={24} color={colors.text.primary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {user.profileImage ? (
                <Image 
                  source={{ uri: user.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Feather name="user" size={40} color={colors.text.secondary} />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileBio}>{user.bio}</Text>
              {user.height && user.weight && (
                <Text style={styles.statsText}>
                  {displayedHeight} • {displayedWeight}
                </Text>
              )}
              {!editMode && (
                <View style={styles.profileActions}>
                  <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                    <Feather name="edit" size={16} color={colors.primary} />
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.signOutButton} 
                    onPress={async () => {
                      await auth.signOut();
                      router.replace('/authpage');
                    }}
                  >
                    <MaterialIcons name="logout" size={16} color={colors.error} />
                    <Text style={styles.signOutButtonText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.goalsContainer}>
            <Text style={styles.sectionTitle}>Fitness Goals</Text>
            <View style={styles.goalsList}>
              {user.goals.map((goal, index) => (
                <View key={index} style={styles.goalItem}>
                  <Text style={styles.goalText}>{goal}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Statistics</Text>
          <View style={styles.statsRow}>
            <StatsCard 
              title="Total Workouts"
              value={totalWorkouts.toString()}
              icon={<AntDesign name="barschart" size={24} color={colors.primary} />}
            />
            <StatsCard 
              title="This Month"
              value={workoutHistory.filter(workout => {
                const workoutDate = new Date(workout.date);
                const now = new Date();
                return workoutDate.getMonth() === now.getMonth() && 
                      workoutDate.getFullYear() === now.getFullYear();
              }).length.toString()}
              icon={<AntDesign name="barschart" size={24} color={colors.accent} />}
            />
          </View>
          <View style={styles.statsRow}>
            <StatsCard 
              title="Current Streak"
              value={`${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}`}
              icon={<Feather name="award" size={24} color={colors.success} />}
            />
            <StatsCard 
              title="Avg. Duration"
              value={`${averageWorkoutTime} min`}
              icon={<AntDesign name="barschart" size={24} color={colors.info} />}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Records</Text>
          {displayedStrengthRecords.map(record => (
  <PersonalRecordCard key={record.id} record={record} />
))}
        </View>

        {editMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <View style={styles.settingsGroup}>
              <Text style={styles.settingsGroupTitle}>Preferences</Text>
              
              <SettingsItem
                label="Use Metric System (kg)"
                description="Switch between metric and imperial units"
                control={
                  <Switch
                    value={user.preferences.useMetric}
                    onValueChange={toggleUnitPreference}
                    trackColor={{ false: colors.text.secondary, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                }
              />
              
              <SettingsItem
                label="Workout Reminders"
                description="Receive notifications for scheduled workouts"
                control={
                  <Switch
                    value={user.preferences.notifications}
                    onValueChange={toggleNotifications}
                    trackColor={{ false: colors.text.secondary, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                }
              />
              
              <SettingsItem
                label="Default Rest Timer"
                description={`${user.preferences.defaultRestTime} seconds`}
                onPress={() => {
                  // Reset to current default before opening modal
                  setRestTimeSeconds(user.preferences.defaultRestTime.toString());
                  setShowRestTimerModal(true);
                }}
              />
              
              <SettingsItem
                label="Data & Privacy"
                description="Manage your data and privacy settings"
                onPress={() => {}}
                labelStyle={{ color: colors.text.disabled }} // Greyed-out text
              />
            </View>

            {/* Settings Group for Account */}
            <View style={styles.settingsGroup}>
              <Text style={styles.settingsGroupTitle}>Account</Text>
              
              {/* Removed the "Change Email" option */}
              
              <SettingsItem
                label="Change Password"
                onPress={() => setShowPasswordModal(true)}
              />
              
              <SettingsItem
                label="Export Data"
                description="Download all your workout data"
                onPress={() => {}}
                labelStyle={{ color: colors.text.disabled }} // Greyed-out text
              />
            </View>
          </View>
        )}
      </ScrollView>

      {showEditProfile && (
        <EditProfileModal
          initialData={{
            name: user.name,
            bio: user.bio,
            goals: user.goals,
            height: user.height,
            weight: user.weight,
            profileImage: user.profileImage,
          }}
          useMetric={user.preferences.useMetric}
          onClose={() => setShowEditProfile(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* Rest Timer Modal */}
      {showRestTimerModal && (
        <Modal
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowRestTimerModal(false)}
        >
          <View style={modalStyles.overlay}>
            <View style={modalStyles.modalContainer}>
              <Text style={modalStyles.title}>Select Default Rest Timer</Text>
              
              {/* Text input for direct entry */}
              <View style={modalStyles.inputContainer}>
                <TextInput
                  style={modalStyles.timerInput}
                  value={restTimeSeconds}
                  onChangeText={handleRestTimeChange}
                  keyboardType="number-pad"
                  placeholder="Enter seconds"
                />
                <Text style={modalStyles.inputLabel}>seconds</Text>
              </View>
              
              <Slider
                minimumValue={5}
                maximumValue={600} // Increased to 10 minutes (600 seconds)
                step={5}
                value={parseInt(restTimeSeconds, 10) || 0}
                onValueChange={(value) => setRestTimeSeconds(value.toString())}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
                style={{ width: '90%', height: 40, marginVertical: spacing.medium }}
              />
              
              <Text style={modalStyles.timerText}>
                {restTimeSeconds} seconds ({Math.floor((parseInt(restTimeSeconds, 10) || 0) / 60)}:{((parseInt(restTimeSeconds, 10) || 0) % 60).toString().padStart(2, '0')})
              </Text>
              
              <TouchableOpacity
                style={modalStyles.confirmButton}
                onPress={() => {
                  updateUserPreference('defaultRestTime', parseInt(restTimeSeconds, 10) || 0);
                  setShowRestTimerModal(false);
                }}
              >
                <Text style={modalStyles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowRestTimerModal(false)}>
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter current password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.large,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.medium,
  },
  timerText: {
    ...typography.bodyBold,
    marginVertical: spacing.medium,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    padding: spacing.medium,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  cancelText: {
    ...typography.body,
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.medium,
    width: '100%',
  },
  timerInput: {
    ...typography.body,
    backgroundColor: colors.card,
    flex: 1,
    padding: spacing.medium,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  inputLabel: {
    ...typography.body,
    marginLeft: spacing.medium,
    color: colors.text.secondary,
  },
});

const styles = StyleSheet.create({
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutButtonText: {
    ...typography.buttonSmall,
    color: colors.error,
    marginLeft: spacing.xsmall,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.large,
  },
  screenTitle: {
    ...typography.h1,
  },
  settingsButton: {
    padding: spacing.small,
  },
  doneText: {
    ...typography.button,
    color: colors.primary,
  },
  profileSection: {
    backgroundColor: colors.card,
    margin: spacing.large,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: spacing.large,
  },
  profileImageContainer: {
    marginRight: spacing.large,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  placeholderImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    ...typography.h2,
    marginBottom: spacing.xsmall,
  },
  profileBio: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.small,
  },
  statsText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.medium,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    ...typography.buttonSmall,
    color: colors.primary,
    marginLeft: spacing.xsmall,
  },
  goalsContainer: {
    padding: spacing.large,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  goalsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.small,
  },
  goalItem: {
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    marginRight: spacing.small,
    marginBottom: spacing.small,
  },
  goalText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  section: {
    margin: spacing.large,
    marginTop: 0,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.medium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.medium,
  },
  settingsGroup: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: spacing.large,
    overflow: 'hidden',
  },
  settingsGroupTitle: {
    ...typography.bodyBold,
    color: colors.text.secondary,
    marginBottom: spacing.small,
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
  },
});