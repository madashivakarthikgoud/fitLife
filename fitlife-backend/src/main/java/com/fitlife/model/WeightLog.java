package com.fitlife.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity
@Table(name = "weight_logs", indexes = {
    @Index(name = "idx_weightlog_user_date", columnList = "user_id, date")
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WeightLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false)
    private Double weightKg;
    @Column(nullable = false)
    private LocalDate date;
    private String notes;
    @Column(updatable = false)
    private LocalDateTime createdAt;
    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}