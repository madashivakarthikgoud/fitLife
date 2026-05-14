package com.fitlife.controller;

import com.fitlife.dto.GoalDto;
import com.fitlife.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<List<GoalDto>> getGoals() {
        return ResponseEntity.ok(goalService.getUserGoals());
    }

    @PostMapping
    public ResponseEntity<GoalDto> createGoal(@RequestBody GoalDto dto) {
        return ResponseEntity.ok(goalService.createGoal(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalDto> updateGoal(@PathVariable Long id,
                                               @RequestBody GoalDto dto) {
        return ResponseEntity.ok(goalService.updateGoal(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}

