package com.fitlife.controller;

import com.fitlife.dto.MealDto;
import com.fitlife.service.MealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    @GetMapping
    public ResponseEntity<List<MealDto>> getTodayMeals() {
        return ResponseEntity.ok(mealService.getTodayMeals());
    }

    @GetMapping("/all")
    public ResponseEntity<List<MealDto>> getAllMeals() {
        return ResponseEntity.ok(mealService.getUserMeals());
    }

    @GetMapping("/history")
    public ResponseEntity<List<MealDto>> getHistory(@RequestParam String start,
                                                     @RequestParam String end) {
        return ResponseEntity.ok(mealService.getMealsByDateRange(
                LocalDate.parse(start), LocalDate.parse(end)));
    }

    @PostMapping
    public ResponseEntity<MealDto> createMeal(@RequestBody MealDto dto) {
        return ResponseEntity.ok(mealService.createMeal(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MealDto> updateMeal(@PathVariable Long id,
                                               @RequestBody MealDto dto) {
        return ResponseEntity.ok(mealService.updateMeal(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeal(@PathVariable Long id) {
        mealService.deleteMeal(id);
        return ResponseEntity.noContent().build();
    }
}
