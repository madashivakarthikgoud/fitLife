package com.fitlife.service;

import com.fitlife.config.DemoUserProvider;
import com.fitlife.dto.WorkoutDto;
import com.fitlife.exception.BadRequestException;
import com.fitlife.exception.NotFoundException;
import com.fitlife.model.User;
import com.fitlife.model.Workout;
import com.fitlife.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final DemoUserProvider demoUserProvider;

    private static final Set<String> CARDIO_TYPES = Set.of("Cardio");
    private static final Set<String> DURATION_ONLY_TYPES = Set.of("Flexibility", "Sports");
    private static final Set<String> SETS_AND_DURATION_TYPES = Set.of("HIIT");

    public List<WorkoutDto> getTodayWorkouts() {
        Long userId = demoUserProvider.getUser().getId();
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        return workoutRepository.findByUserIdAndDateBetween(userId, startOfDay, endOfDay)
                .stream().map(WorkoutDto::from).toList();
    }

    public List<WorkoutDto> getUserWorkouts() {
        Long userId = demoUserProvider.getUser().getId();
        return workoutRepository.findByUserIdOrderByDateDesc(userId)
                .stream().map(WorkoutDto::from).toList();
    }

    public List<WorkoutDto> getWorkoutsByDateRange(LocalDate start, LocalDate end) {
        Long userId = demoUserProvider.getUser().getId();
        return workoutRepository.findByUserIdAndDateBetween(userId,
                start.atStartOfDay(), end.atTime(LocalTime.MAX))
                .stream().map(WorkoutDto::from).toList();
    }

    @Transactional
    public WorkoutDto createWorkout(WorkoutDto dto) {
        if (dto.getCaloriesBurned() == null || dto.getCaloriesBurned() <= 0) {
            throw new BadRequestException("Calories burned is required. Please enter the value from your fitness device.");
        }
        User user = demoUserProvider.getUser();
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
                .caloriesBurned(dto.getCaloriesBurned())
                .build();

        cleanFieldsByType(workout);
        return WorkoutDto.from(workoutRepository.save(workout));
    }

    @Transactional
    public WorkoutDto updateWorkout(Long workoutId, WorkoutDto dto) {
        if (dto.getCaloriesBurned() == null || dto.getCaloriesBurned() <= 0) {
            throw new BadRequestException("Calories burned is required. Please enter the value from your fitness device.");
        }
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new NotFoundException("Workout not found"));

        workout.setExerciseName(dto.getExerciseName());
        workout.setExerciseType(dto.getExerciseType());
        workout.setSets(dto.getSets());
        workout.setReps(dto.getReps());
        workout.setWeightLbs(dto.getWeightLbs());
        workout.setDurationMin(dto.getDurationMin());
        workout.setDistanceKm(dto.getDistanceKm());
        workout.setNotes(dto.getNotes());
        workout.setCaloriesBurned(dto.getCaloriesBurned());

        cleanFieldsByType(workout);
        return WorkoutDto.from(workoutRepository.save(workout));
    }

    @Transactional
    public void deleteWorkout(Long workoutId) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new NotFoundException("Workout not found"));
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
}
