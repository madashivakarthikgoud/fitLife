package com.fitlife.dto;

import com.fitlife.model.WaterLog;
import lombok.Data;
import java.time.LocalDate;

@Data
public class WaterLogDto {
    private Long id;
    private Integer amountMl;
    private LocalDate date;

    public static WaterLogDto from(WaterLog w) {
        WaterLogDto dto = new WaterLogDto();
        dto.setId(w.getId());
        dto.setAmountMl(w.getAmountMl());
        dto.setDate(w.getDate());
        return dto;
    }
}
