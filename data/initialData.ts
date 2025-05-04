import { User } from '@/types/user';
import { WorkoutRoutine, WorkoutSummary } from '@/types/workout';
import { generateUniqueId } from '@/utils/idUtils';

export const initialUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  bio: 'Fitness enthusiast, trying to stay in shape',
  goals: ['Build muscle', 'Improve strength', 'Maintain fitness'],
  // Default to imperial (lbs/inches)
  preferences: {
    useMetric: false,
    notifications: true,
    defaultRestTime: 60,
    darkMode: false,
  },
  // You may also store height in inches and weight in lbs here
  height: 70,     // e.g., 70 inches ~ 178 cm
  weight: 180,    // e.g., 180 lbs ~ 82 kg
};

export const initialRoutines: WorkoutRoutine[] = [
  {
    id: 'routine-1',
    name: 'Upper Body Strength',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    exercises: [
      {
        id: 'exercise-1',
        name: 'Bench Press',
        targetSets: 4,
        targetReps: 8,
        notes: 'Focus on chest contraction',
      },
      {
        id: 'exercise-2',
        name: 'Pull-ups',
        targetSets: 3,
        targetReps: 10,
        notes: 'Use assistance if needed',
      },
      {
        id: 'exercise-3',
        name: 'Shoulder Press',
        targetSets: 3,
        targetReps: 12,
        notes: 'Keep core tight',
      },
      {
        id: 'exercise-4',
        name: 'Bicep Curls',
        targetSets: 3,
        targetReps: 12,
        notes: 'Avoid swinging',
      },
    ],
  },
  {
    id: 'routine-2',
    name: 'Lower Body Power',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    exercises: [
      {
        id: 'exercise-5',
        name: 'Squat',
        targetSets: 4,
        targetReps: 8,
        notes: 'Go below parallel',
      },
      {
        id: 'exercise-6',
        name: 'Deadlift',
        targetSets: 3,
        targetReps: 8,
        notes: 'Keep back straight',
      },
      {
        id: 'exercise-7',
        name: 'Leg Press',
        targetSets: 3,
        targetReps: 12,
        notes: '',
      },
      {
        id: 'exercise-8',
        name: 'Calf Raises',
        targetSets: 4,
        targetReps: 15,
        notes: 'Full range of motion',
      },
    ],
  },
];

export const initialWorkoutHistory: WorkoutSummary[] = [
  {
    id: 'workout-1',
    name: 'Morning Upper Body',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 45 * 60, // 45 minutes in seconds
    exercises: [
      {
        id: 'ex-1',
        name: 'Bench Press',
        sets: [
          { id: generateUniqueId(), weight: '80', reps: '8', completed: true },
          { id: generateUniqueId(), weight: '85', reps: '7', completed: true },
          { id: generateUniqueId(), weight: '85', reps: '6', completed: true },
          { id: generateUniqueId(), weight: '80', reps: '8', completed: true },
        ],
      },
      {
        id: 'ex-2',
        name: 'Pull-ups',
        sets: [
          { id: generateUniqueId(), weight: 'BW', reps: '10', completed: true },
          { id: generateUniqueId(), weight: 'BW', reps: '8', completed: true },
          { id: generateUniqueId(), weight: 'BW', reps: '8', completed: true },
        ],
      },
      {
        id: 'ex-3',
        name: 'Bicep Curls',
        sets: [
          { id: generateUniqueId(), weight: '15', reps: '12', completed: true },
          { id: generateUniqueId(), weight: '15', reps: '10', completed: true },
          { id: generateUniqueId(), weight: '12.5', reps: '12', completed: true },
        ],
      },
    ],
    totalSets: 10,
    completedSets: 10,
  },
  {
    id: 'workout-2',
    name: 'Leg Day',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 55 * 60, // 55 minutes in seconds
    exercises: [
      {
        id: 'ex-4',
        name: 'Squats',
        sets: [
          { id: generateUniqueId(), weight: '100', reps: '8', completed: true },
          { id: generateUniqueId(), weight: '110', reps: '8', completed: true },
          { id: generateUniqueId(), weight: '120', reps: '6', completed: true },
          { id: generateUniqueId(), weight: '120', reps: '6', completed: true },
        ],
      },
      {
        id: 'ex-5',
        name: 'Leg Press',
        sets: [
          { id: generateUniqueId(), weight: '150', reps: '12', completed: true },
          { id: generateUniqueId(), weight: '170', reps: '10', completed: true },
          { id: generateUniqueId(), weight: '170', reps: '10', completed: true },
        ],
      },
      {
        id: 'ex-6',
        name: 'Lunges',
        sets: [
          { id: generateUniqueId(), weight: '20', reps: '10', completed: true },
          { id: generateUniqueId(), weight: '20', reps: '10', completed: true },
          { id: generateUniqueId(), weight: '20', reps: '10', completed: true },
        ],
      },
    ],
    totalSets: 10,
    completedSets: 10,
  },
];

// Exercise database for search functionality
export const exerciseDatabase = [
  { id: 'db-1', name: 'Bench Press', category: 'Chest', equipment: 'Barbell' },
  { id: 'db-2', name: 'Incline Bench Press', category: 'Chest', equipment: 'Barbell' },
  { id: 'db-3', name: 'Decline Bench Press', category: 'Chest', equipment: 'Barbell' },
  { id: 'db-4', name: 'Dumbbell Fly', category: 'Chest', equipment: 'Dumbbells' },
  { id: 'db-5', name: 'Push-up', category: 'Chest', equipment: 'Bodyweight' },
  
  { id: 'db-6', name: 'Pull-up', category: 'Back', equipment: 'Bodyweight' },
  { id: 'db-7', name: 'Lat Pulldown', category: 'Back', equipment: 'Cable' },
  { id: 'db-8', name: 'Bent Over Row', category: 'Back', equipment: 'Barbell' },
  { id: 'db-9', name: 'Seated Row', category: 'Back', equipment: 'Cable' },
  { id: 'db-10', name: 'Deadlift', category: 'Back', equipment: 'Barbell' },
  
  { id: 'db-11', name: 'Overhead Press', category: 'Shoulders', equipment: 'Barbell' },
  { id: 'db-12', name: 'Lateral Raise', category: 'Shoulders', equipment: 'Dumbbells' },
  { id: 'db-13', name: 'Front Raise', category: 'Shoulders', equipment: 'Dumbbells' },
  { id: 'db-14', name: 'Reverse Fly', category: 'Shoulders', equipment: 'Dumbbells' },
  { id: 'db-15', name: 'Shrug', category: 'Shoulders', equipment: 'Barbell' },
  
  { id: 'db-16', name: 'Bicep Curl', category: 'Arms', equipment: 'Barbell' },
  { id: 'db-17', name: 'Hammer Curl', category: 'Arms', equipment: 'Dumbbells' },
  { id: 'db-18', name: 'Tricep Extension', category: 'Arms', equipment: 'Cable' },
  { id: 'db-19', name: 'Skull Crusher', category: 'Arms', equipment: 'Barbell' },
  { id: 'db-20', name: 'Dip', category: 'Arms', equipment: 'Bodyweight' },
  
  { id: 'db-21', name: 'Squat', category: 'Legs', equipment: 'Barbell' },
  { id: 'db-22', name: 'Leg Press', category: 'Legs', equipment: 'Machine' },
  { id: 'db-23', name: 'Lunge', category: 'Legs', equipment: 'Dumbbells' },
  { id: 'db-24', name: 'Leg Extension', category: 'Legs', equipment: 'Machine' },
  { id: 'db-25', name: 'Leg Curl', category: 'Legs', equipment: 'Machine' },
  
  { id: 'db-26', name: 'Calf Raise', category: 'Calves', equipment: 'Machine' },
  { id: 'db-27', name: 'Seated Calf Raise', category: 'Calves', equipment: 'Machine' },
  
  { id: 'db-28', name: 'Crunch', category: 'Core', equipment: 'Bodyweight' },
  { id: 'db-29', name: 'Plank', category: 'Core', equipment: 'Bodyweight' },
  { id: 'db-30', name: 'Russian Twist', category: 'Core', equipment: 'Bodyweight' },
];