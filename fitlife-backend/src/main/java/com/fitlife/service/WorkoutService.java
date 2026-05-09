package com.fitlife.service;

import com.fitlife.dto.WorkoutDto;
import com.fitlife.model.User;
import com.fitlife.model.Workout;
import com.fitlife.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;

    private static final Set<String> CARDIO_TYPES = Set.of("Cardio");
    private static final Set<String> DURATION_ONLY_TYPES = Set.of("Flexibility", "Sports");
    private static final Set<String> SETS_AND_DURATION_TYPES = Set.of("HIIT");

    public List<WorkoutDto> getUserWorkouts(Long userId) {
        return workoutRepository.findByUserIdOrderByDateDesc(userId)
                .stream().map(WorkoutDto::from).toList();
    }

    public WorkoutDto createWorkout(User user, WorkoutDto dto) {
        Workout workout = Workout.builder()
                .user(user)
                .exerciseName(dto.getExerciseName())
                .exerciseType(dto.getExerciseType())
                .sets(dto.getSets())
                .reps(dto.getReps())
                .weightLbs(dto.getWeightLbs())
                .durationMin(dto.getDurationMin())
                .distanceKm(dto.getDistanceKm())
                .notes(dto.getNotes())
                .caloriesBurned(estimateCalories(dto))
                .build();

        // Clear irrelevant fields based on type
        cleanFieldsByType(workout);

        return WorkoutDto.from(workoutRepository.save(workout));
    }

    public WorkoutDto updateWorkout(Long userId, Long workoutId, WorkoutDto dto) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        if (!workout.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        workout.setExerciseName(dto.getExerciseName());
        workout.setExerciseType(dto.getExerciseType());
        workout.setSets(dto.getSets());
        workout.setReps(dto.getReps());
        workout.setWeightLbs(dto.getWeightLbs());
        workout.setDurationMin(dto.getDurationMin());
        workout.setDistanceKm(dto.getDistanceKm());
        workout.setNotes(dto.getNotes());
        workout.setCaloriesBurned(estimateCalories(dto));

        cleanFieldsByType(workout);

        return WorkoutDto.from(workoutRepository.save(workout));
    }

    public void deleteWorkout(Long userId, Long workoutId) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new RuntimeException("Workout not found"));
        if (!workout.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        workoutRepository.delete(workout);
    }

    private void cleanFieldsByType(Workout w) {
        String type = w.getExerciseType();
        if (CARDIO_TYPES.contains(type)) {
            w.setSets(null); w.setReps(null); w.setWeightLbs(null);
        } else if (DURATION_ONLY_TYPES.contains(type)) {
            w.setSets(null); w.setReps(null); w.setWeightLbs(null); w.setDistanceKm(null);
        } else if (SETS_AND_DURATION_TYPES.contains(type)) {
            w.setWeightLbs(null); w.setDistanceKm(null);
        } else if ("Strength".equals(type)) {
            w.setDurationMin(null); w.setDistanceKm(null);
        }
    }

    private int estimateCalories(WorkoutDto dto) {
        String type = dto.getExerciseType();
        if (CARDIO_TYPES.contains(type) && dto.getDurationMin() != null) {
            return (int) Math.round(dto.getDurationMin() * 8);
        }
        if (dto.getSets() != null && dto.getReps() != null) {
            return dto.getSets() * dto.getReps() * 3;
        }
        if (dto.getDurationMin() != null) {
            return (int) Math.round(dto.getDurationMin() * 5);
        }
        return 50;
    }
}
