package com.fitlife.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class WeightLogRequest {
    private Double weightKg;
    private LocalDate date;
    private String notes;
}

