package com.fitlife.dto;
import com.fitlife.model.WeightLog;
import lombok.Data;
import java.time.LocalDate;
@Data
public class WeightLogDto {
    private Long id;
    private Double weightKg;
    private LocalDate date;
    private String notes;
    public static WeightLogDto from(WeightLog w) {
        WeightLogDto dto = new WeightLogDto();
        dto.setId(w.getId());
        dto.setWeightKg(w.getWeightKg());
        dto.setDate(w.getDate());
        dto.setNotes(w.getNotes());
        return dto;
    }
}