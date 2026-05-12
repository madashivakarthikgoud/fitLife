package com.fitlife.dto;

import com.fitlife.model.Goal;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class GoalDto {
    private Long id;
    private String title;
    private String type;
    private Double targetValue;
    private Double currentValue;
    private String unit;
    private LocalDate deadline;
    private Boolean completed;
    private LocalDateTime createdAt;

    public static GoalDto from(Goal g) {
        GoalDto dto = new GoalDto();
        dto.setId(g.getId());
        dto.setTitle(g.getTitle());
        dto.setType(g.getType());
        dto.setTargetValue(g.getTargetValue());
        dto.setCurrentValue(g.getCurrentValue());
        dto.setUnit(g.getUnit());
        dto.setDeadline(g.getDeadline());
        dto.setCompleted(g.getCompleted());
        dto.setCreatedAt(g.getCreatedAt());
        return dto;
    }
}
