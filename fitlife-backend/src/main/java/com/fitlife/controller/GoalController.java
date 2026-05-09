package com.fitlife.controller;

import com.fitlife.dto.GoalDto;
import com.fitlife.model.User;
import com.fitlife.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<List<GoalDto>> getGoals(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalService.getUserGoals(user.getId()));
    }

    @PostMapping
    public ResponseEntity<GoalDto> createGoal(@AuthenticationPrincipal User user,
                                               @RequestBody GoalDto dto) {
        return ResponseEntity.ok(goalService.createGoal(user, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalDto> updateGoal(@AuthenticationPrincipal User user,
                                               @PathVariable Long id,
                                               @RequestBody GoalDto dto) {
        return ResponseEntity.ok(goalService.updateGoal(user.getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@AuthenticationPrincipal User user,
                                            @PathVariable Long id) {
        goalService.deleteGoal(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
