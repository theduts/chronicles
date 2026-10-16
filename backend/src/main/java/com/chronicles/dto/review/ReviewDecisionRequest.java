package com.chronicles.dto.review;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDecisionRequest {
    @Size(max = 2000, message = "O feedback deve ter no máximo 2000 caracteres")
    private String dmFeedback;
}
