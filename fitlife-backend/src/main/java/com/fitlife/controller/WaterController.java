package com.fitlife.controller;

import com.fitlife.dto.WaterLogDto;
import com.fitlife.service.WaterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/water")
@RequiredArgsConstructor
public class WaterController {

    private final WaterService waterService;

    @GetMapping
    public ResponseEntity<List<WaterLogDto>> getToday() {
        return ResponseEntity.ok(waterService.getTodayLogs());
    }

    @GetMapping("/all")
    public ResponseEntity<List<WaterLogDto>> getAll() {
        return ResponseEntity.ok(waterService.getAllLogs());
    }

    @GetMapping("/history")
    public ResponseEntity<List<WaterLogDto>> getHistory(@RequestParam String start,
                                                         @RequestParam String end) {
        return ResponseEntity.ok(waterService.getLogsByDateRange(
                LocalDate.parse(start), LocalDate.parse(end)));
    }

    @PostMapping
    public ResponseEntity<WaterLogDto> add(@RequestBody Map<String, Integer> body) {
        int amount = body.getOrDefault("amountMl", 0);
        return ResponseEntity.ok(waterService.addLog(amount));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        waterService.deleteLog(id);
        return ResponseEntity.noContent().build();
    }
}
