package com.fitlife.service;

import com.fitlife.config.DemoUserProvider;
import com.fitlife.dto.MealDto;
import com.fitlife.exception.NotFoundException;
import com.fitlife.model.Meal;
import com.fitlife.model.User;
import com.fitlife.repository.MealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository mealRepository;
    private final DemoUserProvider demoUserProvider;

    public List<MealDto> getTodayMeals() {
        Long userId = demoUserProvider.getUser().getId();
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        return mealRepository.findByUserIdAndDateBetween(userId, startOfDay, endOfDay)
                .stream().map(MealDto::from).toList();
    }

    public List<MealDto> getUserMeals() {
        Long userId = demoUserProvider.getUser().getId();
        return mealRepository.findByUserIdOrderByDateDesc(userId)
                .stream().map(MealDto::from).toList();
    }

    public List<MealDto> getMealsByDateRange(LocalDate start, LocalDate end) {
        Long userId = demoUserProvider.getUser().getId();
        return mealRepository.findByUserIdAndDateBetween(userId,
                start.atStartOfDay(), end.atTime(LocalTime.MAX))
                .stream().map(MealDto::from).toList();
    }

    @Transactional
    public MealDto createMeal(MealDto dto) {
        User user = demoUserProvider.getUser();
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

    @Transactional
    public MealDto updateMeal(Long mealId, MealDto dto) {
        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() -> new NotFoundException("Meal not found"));
        meal.setFoodName(dto.getFoodName());
        meal.setMealType(dto.getMealType());
        meal.setQuantity(dto.getQuantity());
        meal.setUnit(dto.getUnit());
        meal.setCalories(dto.getCalories());
        meal.setProtein(dto.getProtein());
        meal.setCarbs(dto.getCarbs());
        meal.setFat(dto.getFat());
        return MealDto.from(mealRepository.save(meal));
    }

    @Transactional
    public void deleteMeal(Long mealId) {
        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() -> new NotFoundException("Meal not found"));
        mealRepository.delete(meal);
    }
}
