package com.fitlife.controller;

import com.fitlife.dto.WorkoutDto;
import com.fitlife.model.User;
import com.fitlife.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @GetMapping
    public ResponseEntity<List<WorkoutDto>> getWorkouts(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(workoutService.getUserWorkouts(user.getId()));
    }

    @PostMapping
    public ResponseEntity<WorkoutDto> createWorkout(@AuthenticationPrincipal User user,
                                                     @RequestBody WorkoutDto dto) {
        return ResponseEntity.ok(workoutService.createWorkout(user, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutDto> updateWorkout(@AuthenticationPrincipal User user,
                                                     @PathVariable Long id,
                                                     @RequestBody WorkoutDto dto) {
        return ResponseEntity.ok(workoutService.updateWorkout(user.getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(@AuthenticationPrincipal User user,
                                               @PathVariable Long id) {
        workoutService.deleteWorkout(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
