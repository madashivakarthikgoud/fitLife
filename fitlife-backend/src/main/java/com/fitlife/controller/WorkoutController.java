package com.fitlife.controller;

import com.fitlife.dto.WorkoutDto;
import com.fitlife.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @GetMapping
    public ResponseEntity<List<WorkoutDto>> getTodayWorkouts() {
        return ResponseEntity.ok(workoutService.getTodayWorkouts());
    }

    @GetMapping("/all")
    public ResponseEntity<List<WorkoutDto>> getAllWorkouts() {
        return ResponseEntity.ok(workoutService.getUserWorkouts());
    }

    @GetMapping("/history")
    public ResponseEntity<List<WorkoutDto>> getHistory(@RequestParam String start,
                                                        @RequestParam String end) {
        return ResponseEntity.ok(workoutService.getWorkoutsByDateRange(
                LocalDate.parse(start), LocalDate.parse(end)));
    }

    @PostMapping
    public ResponseEntity<WorkoutDto> createWorkout(@RequestBody WorkoutDto dto) {
        return ResponseEntity.ok(workoutService.createWorkout(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutDto> updateWorkout(@PathVariable Long id,
                                                     @RequestBody WorkoutDto dto) {
        return ResponseEntity.ok(workoutService.updateWorkout(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(@PathVariable Long id) {
        workoutService.deleteWorkout(id);
        return ResponseEntity.noContent().build();
    }
}
