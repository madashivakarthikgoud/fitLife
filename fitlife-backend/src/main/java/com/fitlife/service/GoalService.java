package com.fitlife.service;

import com.fitlife.dto.GoalDto;
import com.fitlife.model.Goal;
import com.fitlife.model.User;
import com.fitlife.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;

    public List<GoalDto> getUserGoals(Long userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(GoalDto::from).toList();
    }

    public GoalDto createGoal(User user, GoalDto dto) {
        Goal goal = Goal.builder()
                .user(user)
                .title(dto.getTitle())
                .type(dto.getType())
                .targetValue(dto.getTargetValue())
                .currentValue(dto.getCurrentValue() != null ? dto.getCurrentValue() : 0.0)
                .unit(dto.getUnit())
                .deadline(dto.getDeadline())
                .build();
        return GoalDto.from(goalRepository.save(goal));
    }

    public GoalDto updateGoal(Long userId, Long goalId, GoalDto dto) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (dto.getTitle() != null) goal.setTitle(dto.getTitle());
        if (dto.getTargetValue() != null) goal.setTargetValue(dto.getTargetValue());
        if (dto.getCurrentValue() != null) goal.setCurrentValue(dto.getCurrentValue());
        if (dto.getUnit() != null) goal.setUnit(dto.getUnit());
        if (dto.getDeadline() != null) goal.setDeadline(dto.getDeadline());
        if (dto.getCompleted() != null) goal.setCompleted(dto.getCompleted());

        if (goal.getCurrentValue() >= goal.getTargetValue()) {
            goal.setCompleted(true);
        }

        return GoalDto.from(goalRepository.save(goal));
    }

    public void deleteGoal(Long userId, Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        if (!goal.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        goalRepository.delete(goal);
    }
}
