package com.fitlife.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "meals", indexes = {
    @Index(name = "idx_meal_user_date", columnList = "user_id, date")
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Meal {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String foodName;

    @Column(nullable = false)
    private String mealType;

    private Double quantity;
    private String unit;
    private Integer calories;
    private Double protein;
    private Double carbs;
    private Double fat;

    @Column(updatable = false)
    private LocalDateTime date;

    @PrePersist
    protected void onCreate() { if (date == null) date = LocalDateTime.now(); }
}
