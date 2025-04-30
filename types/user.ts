export interface UserPreferences {
  useMetric: boolean;
  notifications: boolean;
  defaultRestTime: number;
  darkMode: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  goals: string[];
  preferences: UserPreferences;
  profileImage?: string;
  height?: number;
  weight?: number;
}

export interface EditProfileFormData {
  name: string;
  bio: string;
  goals: string[];
  height?: number;
  weight?: number;
  profileImage?: string;
}