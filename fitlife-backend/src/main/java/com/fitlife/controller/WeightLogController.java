package com.fitlife.controller;

import com.fitlife.dto.WeightLogDto;
import com.fitlife.dto.WeightLogRequest;
import com.fitlife.service.WeightLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/weight-logs")
@RequiredArgsConstructor
public class WeightLogController {

    private final WeightLogService weightLogService;

    @GetMapping
    public ResponseEntity<List<WeightLogDto>> getHistory() {
        return ResponseEntity.ok(weightLogService.getHistory());
    }

    @GetMapping("/latest")
    public ResponseEntity<WeightLogDto> getLatest() {
        WeightLogDto dto = weightLogService.getLatest();
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<WeightLogDto> log(@RequestBody WeightLogRequest request) {
        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        return ResponseEntity.ok(weightLogService.logWeight(request.getWeightKg(), date, request.getNotes()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        weightLogService.deleteLog(id);
        return ResponseEntity.noContent().build();
    }
}