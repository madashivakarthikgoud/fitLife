package com.fitlife.service;

import com.fitlife.dto.MealDto;
import com.fitlife.model.Meal;
import com.fitlife.model.User;
import com.fitlife.repository.MealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository mealRepository;

    public List<MealDto> getUserMeals(Long userId) {
        return mealRepository.findByUserIdOrderByDateDesc(userId)
                .stream().map(MealDto::from).toList();
    }

    public MealDto createMeal(User user, MealDto dto) {
        Meal meal = Meal.builder()
                .user(user)
                .foodName(dto.getFoodName())
                .mealType(dto.getMealType())
                .quantity(dto.getQuantity())
                .unit(dto.getUnit())
                .calories(dto.getCalories())
                .protein(dto.getProtein())
                .carbs(dto.getCarbs())
                .fat(dto.getFat())
                .build();
        return MealDto.from(mealRepository.save(meal));
    }

    public void deleteMeal(Long userId, Long mealId) {
        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() -> new RuntimeException("Meal not found"));
        if (!meal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        mealRepository.delete(meal);
    }
}
