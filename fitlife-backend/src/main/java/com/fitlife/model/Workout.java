package com.fitlife.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workouts", indexes = {
    @Index(name = "idx_workout_user_date", columnList = "user_id, date")
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Workout {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String exerciseName;

    @Column(nullable = false)
    private String exerciseType;

    private Integer sets;
    private Integer reps;
    private Double weightLbs;
    private Double durationMin;
    private Double distanceKm;
    private String notes;
    private Integer caloriesBurned;

    @Column(updatable = false)
    private LocalDateTime date;

    @PrePersist
    protected void onCreate() { if (date == null) date = LocalDateTime.now(); }
}
