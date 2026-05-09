package com.fitlife.dto;

import com.fitlife.model.User;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private Integer age;
    private String gender;
    private Double heightCm;
    private Double weightKg;
    private String activityLevel;
    private String fitnessGoal;
    private String avatarUrl;

    public static UserDto from(User u) {
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setFullName(u.getFullName());
        dto.setEmail(u.getEmail());
        dto.setAge(u.getAge());
        dto.setGender(u.getGender());
        dto.setHeightCm(u.getHeightCm());
        dto.setWeightKg(u.getWeightKg());
        dto.setActivityLevel(u.getActivityLevel());
        dto.setFitnessGoal(u.getFitnessGoal());
        dto.setAvatarUrl(u.getAvatarUrl());
        return dto;
    }
}
