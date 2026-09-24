package com.chronicles.domain.jsonb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class CampaignGenres {
    private Boolean arkanun;
    private Boolean trevas;
    private Boolean invasao;
    private Boolean supers;
    private Boolean fantasia;
    private Boolean terror;
    private Boolean scifi;
    private Boolean cyberpunk;
}
