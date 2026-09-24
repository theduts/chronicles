package com.chronicles.domain.jsonb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CharacterAttributes {
    private AttributeRow con;

    @JsonProperty("for")
    private AttributeRow forAttr;

    private AttributeRow des;
    private AttributeRow agi;

    @JsonProperty("int")
    private AttributeRow intAttr;

    private AttributeRow per;
    private AttributeRow will;
    private AttributeRow car;
}
