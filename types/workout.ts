export interface ExerciseSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets?: ExerciseSet[];
  targetSets?: number;
  targetReps?: number;
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  createdAt: string;
}

export interface WorkoutSummary {
  id: string;
  name: string;
  date: string;
  duration: number;
  exercises: WorkoutExercise[];
  totalSets: number;
  completedSets: number;
}