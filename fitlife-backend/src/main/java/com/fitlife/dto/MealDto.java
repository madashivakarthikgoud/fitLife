package com.fitlife.dto;

import com.fitlife.model.Meal;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MealDto {
    private Long id;
    private String foodName;
    private String mealType;
    private Double quantity;
    private String unit;
    private Integer calories;
    private Double protein;
    private Double carbs;
    private Double fat;
    private LocalDateTime date;

    public static MealDto from(Meal m) {
        MealDto dto = new MealDto();
        dto.setId(m.getId());
        dto.setFoodName(m.getFoodName());
        dto.setMealType(m.getMealType());
        dto.setQuantity(m.getQuantity());
        dto.setUnit(m.getUnit());
        dto.setCalories(m.getCalories());
        dto.setProtein(m.getProtein());
        dto.setCarbs(m.getCarbs());
        dto.setFat(m.getFat());
        dto.setDate(m.getDate());
        return dto;
    }
}
