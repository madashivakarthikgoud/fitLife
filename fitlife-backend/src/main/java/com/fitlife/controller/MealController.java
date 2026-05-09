package com.fitlife.controller;

import com.fitlife.dto.MealDto;
import com.fitlife.model.User;
import com.fitlife.service.MealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    @GetMapping
    public ResponseEntity<List<MealDto>> getMeals(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(mealService.getUserMeals(user.getId()));
    }

    @PostMapping
    public ResponseEntity<MealDto> createMeal(@AuthenticationPrincipal User user,
                                               @RequestBody MealDto dto) {
        return ResponseEntity.ok(mealService.createMeal(user, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeal(@AuthenticationPrincipal User user,
                                            @PathVariable Long id) {
        mealService.deleteMeal(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
