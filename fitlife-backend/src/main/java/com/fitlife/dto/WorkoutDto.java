package com.fitlife.dto;

import com.fitlife.model.Workout;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WorkoutDto {
    private Long id;
    private String exerciseName;
    private String exerciseType;
    private Integer sets;
    private Integer reps;
    private Double weightLbs;
    private Double durationMin;
    private Double distanceKm;
    private String notes;
    private Integer caloriesBurned;
    private LocalDateTime date;

    public static WorkoutDto from(Workout w) {
        WorkoutDto dto = new WorkoutDto();
        dto.setId(w.getId());
        dto.setExerciseName(w.getExerciseName());
        dto.setExerciseType(w.getExerciseType());
        dto.setSets(w.getSets());
        dto.setReps(w.getReps());
        dto.setWeightLbs(w.getWeightLbs());
        dto.setDurationMin(w.getDurationMin());
        dto.setDistanceKm(w.getDistanceKm());
        dto.setNotes(w.getNotes());
        dto.setCaloriesBurned(w.getCaloriesBurned());
        dto.setDate(w.getDate());
        return dto;
    }
}
