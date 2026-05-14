package com.fitlife.controller;

import com.fitlife.dto.UserDto;
import com.fitlife.model.User;
import com.fitlife.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile() {
        User user = userRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Demo user not found"));
        return ResponseEntity.ok(UserDto.from(user));
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<UserDto> updateProfile(@RequestBody UserDto dto) {
        User user = userRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Demo user not found"));
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getAge() != null) user.setAge(dto.getAge());
        if (dto.getGender() != null) user.setGender(dto.getGender());
        if (dto.getHeightCm() != null) user.setHeightCm(dto.getHeightCm());
        if (dto.getWeightKg() != null) user.setWeightKg(dto.getWeightKg());
        if (dto.getActivityLevel() != null) user.setActivityLevel(dto.getActivityLevel());
        if (dto.getFitnessGoal() != null) user.setFitnessGoal(dto.getFitnessGoal());

        return ResponseEntity.ok(UserDto.from(userRepository.save(user)));
    }
}

