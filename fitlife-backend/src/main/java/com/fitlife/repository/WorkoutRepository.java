package com.fitlife.repository;

import com.fitlife.model.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    List<Workout> findByUserIdOrderByDateDesc(Long userId);
    List<Workout> findByUserIdAndDateBetween(Long userId, LocalDateTime start, LocalDateTime end);
}
