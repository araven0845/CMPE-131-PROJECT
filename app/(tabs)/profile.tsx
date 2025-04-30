import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Switch, TextInput, Modal } from 'react-native';
import { Settings, Award, CreditCard as Edit, LogOut, ChartBar as BarChart2, User } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { UserContext } from '@/context/UserContext';
import { WorkoutContext } from '@/context/WorkoutContext';
import PersonalRecordCard from '@/components/profile/PersonalRecordCard';
import StatsCard from '@/components/profile/StatsCard';
import SettingsItem from '@/components/profile/SettingsItem';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { EditProfileFormData } from '@/types/user';
import { useEffect } from 'react';
import { auth } from '@/FirebaseConfig';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export default function ProfileScreen() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/authpage');
      }
    });
    return () => unsubscribe();
  }, []);

  const { user, updateUser, updateUserPreference } = useContext(UserContext);
  const { workoutHistory } = useContext(WorkoutContext);
  const [editMode, setEditMode] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // NEW: State for the rest timer modal
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [selectedRestTime, setSelectedRestTime] = useState(user.preferences.defaultRestTime);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const totalWorkouts = workoutHistory.length;
  const totalWorkoutTime = workoutHistory.reduce((sum, workout) => sum + (workout.duration || 0), 0);
  const averageWorkoutTime = totalWorkouts > 0 ? Math.floor(totalWorkoutTime / totalWorkouts) : 0;
  
  const strengthRecords = [
    { id: '1', name: 'Bench Press', value: '95 kg', date: '2023-11-15' },
    { id: '2', name: 'Squat', value: '140 kg', date: '2023-10-28' },
    { id: '3', name: 'Deadlift', value: '160 kg', date: '2023-12-02' },
  ];

  const toggleUnitPreference = () => {
    const newUseMetric = !user.preferences.useMetric;
    let newHeight = user.height;
    let newWeight = user.weight;

    if (newUseMetric) {
      // Converting from Imperial (inches, lbs) to Metric (cm, kg)
      newHeight = Math.round((user.height ?? 0) * 2.54);
      newWeight = Math.round((user.weight ?? 0) / 2.20462);
    } else {
      // Converting from Metric to Imperial
      newHeight = Math.round((user.height ?? 0) / 2.54);
      newWeight = Math.round((user.weight ?? 0) * 2.20462);
    }

    // Update both the user's height/weight and the metric preference
    updateUser({ ...user, height: newHeight, weight: newWeight });
    updateUserPreference('useMetric', newUseMetric);
  };

  const toggleNotifications = () => {
    updateUserPreference('notifications', !user.preferences.notifications);
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

  if (!user) return null;

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

  // Convert personal records if switching to Imperial (lbs)
  const displayedStrengthRecords = strengthRecords.map(record => {
    if (!user.preferences.useMetric) {
      const kg = parseFloat(record.value); // value comes as e.g. "95 kg"
      const lbs = Math.round(kg * 2.20462);
      return { ...record, value: `${lbs} lbs` };
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
              <Settings size={24} color={colors.text.primary} />
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
                  <User size={40} color={colors.text.secondary} />
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
                    <Edit size={16} color={colors.primary} />
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.signOutButton} 
                    onPress={async () => {
                      await auth.signOut();
                      router.replace('/authpage');
                    }}
                  >
                    <LogOut size={16} color={colors.error} />
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
              icon={<BarChart2 size={24} color={colors.primary} />}
            />
            <StatsCard 
              title="This Month"
              value={(totalWorkouts > 0 ? Math.ceil(totalWorkouts * 0.4) : 0).toString()}
              icon={<BarChart2 size={24} color={colors.accent} />}
            />
          </View>
          <View style={styles.statsRow}>
            <StatsCard 
              title="Current Streak"
              value="3 days"
              icon={<Award size={24} color={colors.success} />}
            />
            <StatsCard 
              title="Avg. Duration"
              value={`${averageWorkoutTime} min`}
              icon={<BarChart2 size={24} color={colors.info} />}
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
                  setSelectedRestTime(user.preferences.defaultRestTime);
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
                description="Last changed 3 months ago"
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
              <Slider
                minimumValue={5}
                maximumValue={300}
                step={5}
                value={selectedRestTime}
                onValueChange={setSelectedRestTime}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
                style={{ width: '90%', height: 40 }}
              />
              <Text style={modalStyles.timerText}>{selectedRestTime} seconds</Text>
              <TouchableOpacity
                style={modalStyles.confirmButton}
                onPress={() => {
                  updateUserPreference('defaultRestTime', selectedRestTime);
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