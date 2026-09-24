package com.chronicles.domain.jsonb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Protection {
    private Object ipCinetico;
    private Object ipBalistico;
    private Object ipEscudo;
    private Object ipPsiquico;
    private Object ipMagico;
    private ArmorDurability durabilidadeArmadura;
    private Object baseIpPsiquico;
    private Object baseIpEscudo;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ArmorDurability {
        private Object atual;
        private Object total;
    }
}
