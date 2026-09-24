package com.chronicles.dto.campaign;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddPlayerRequest {
    private String email;
    private String inviteCode;
}
