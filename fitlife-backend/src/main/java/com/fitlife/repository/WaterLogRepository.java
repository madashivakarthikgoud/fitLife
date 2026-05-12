package com.fitlife.repository;

import com.fitlife.model.WaterLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface WaterLogRepository extends JpaRepository<WaterLog, Long> {
    List<WaterLog> findByUserIdAndDateOrderByCreatedAtDesc(Long userId, LocalDate date);
    List<WaterLog> findByUserIdOrderByDateDescCreatedAtDesc(Long userId);
    List<WaterLog> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate start, LocalDate end);
}
