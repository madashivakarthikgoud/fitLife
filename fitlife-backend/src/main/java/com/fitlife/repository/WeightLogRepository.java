package com.fitlife.repository;
import com.fitlife.model.WeightLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface WeightLogRepository extends JpaRepository<WeightLog, Long> {
    List<WeightLog> findByUserIdOrderByDateDesc(Long userId);
    Optional<WeightLog> findFirstByUserIdOrderByDateDesc(Long userId);
    Optional<WeightLog> findFirstByUserIdOrderByDateAsc(Long userId);
}