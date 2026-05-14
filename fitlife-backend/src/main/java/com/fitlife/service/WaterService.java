package com.fitlife.service;

import com.fitlife.config.DemoUserProvider;
import com.fitlife.dto.WaterLogDto;
import com.fitlife.exception.BadRequestException;
import com.fitlife.exception.NotFoundException;
import com.fitlife.model.User;
import com.fitlife.model.WaterLog;
import com.fitlife.repository.WaterLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WaterService {

    private final WaterLogRepository waterLogRepository;
    private final DemoUserProvider demoUserProvider;

    public List<WaterLogDto> getTodayLogs() {
        Long userId = demoUserProvider.getUser().getId();
        return waterLogRepository.findByUserIdAndDateOrderByCreatedAtDesc(userId, LocalDate.now())
                .stream().map(WaterLogDto::from).toList();
    }

    public List<WaterLogDto> getAllLogs() {
        Long userId = demoUserProvider.getUser().getId();
        return waterLogRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId)
                .stream().map(WaterLogDto::from).toList();
    }

    public List<WaterLogDto> getLogsByDateRange(LocalDate start, LocalDate end) {
        Long userId = demoUserProvider.getUser().getId();
        return waterLogRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, start, end)
                .stream().map(WaterLogDto::from).toList();
    }

    @Transactional
    public WaterLogDto addLog(int amountMl) {
        if (amountMl <= 0) throw new BadRequestException("Amount must be positive");
        User user = demoUserProvider.getUser();
        WaterLog log = WaterLog.builder()
                .user(user)
                .amountMl(amountMl)
                .date(LocalDate.now())
                .build();
        return WaterLogDto.from(waterLogRepository.save(log));
    }

    @Transactional
    public void deleteLog(Long logId) {
        WaterLog log = waterLogRepository.findById(logId)
                .orElseThrow(() -> new NotFoundException("Water log not found"));
        waterLogRepository.delete(log);
    }
}
