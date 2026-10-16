package com.chronicles.service;

import com.chronicles.domain.jsonb.AttributeRow;
import com.chronicles.domain.jsonb.CharacterAttributes;
import com.chronicles.domain.jsonb.CharacterSheet;
import com.chronicles.domain.jsonb.SkillRow;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SheetDiffCalculatorTest {

    private final SheetDiffCalculator calculator = new SheetDiffCalculator(new ObjectMapper());

    @Test
    void returnsEmptyDeltaForIdenticalSheets() {
        CharacterSheet sheet = CharacterSheet.builder().name("A").level(1).build();
        assertTrue(calculator.diff(sheet, sheet).isEmpty());
    }

    @Test
    void detectsNestedAttributeChange() {
        CharacterSheet last = CharacterSheet.builder().attributes(CharacterAttributes.builder()
                .forAttr(AttributeRow.builder().natural(12).build()).build()).build();
        CharacterSheet proposed = CharacterSheet.builder().attributes(CharacterAttributes.builder()
                .forAttr(AttributeRow.builder().natural(14).build()).build()).build();

        ObjectNode delta = calculator.diff(last, proposed);

        assertEquals(12, delta.at("/attributes/for/natural/last").asInt());
        assertEquals(14, delta.at("/attributes/for/natural/new").asInt());
        assertEquals(1, delta.size());
    }

    @Test
    void diffsSkillsByNameAndIgnoresUnchanged() {
        CharacterSheet last = CharacterSheet.builder().skills(List.of(
                SkillRow.builder().group("Armas Brancas").build(),
                SkillRow.builder().group("Furtividade").build())).build();
        CharacterSheet proposed = CharacterSheet.builder().skills(List.of(
                SkillRow.builder().group("Armas Brancas").atkGasto(5).build(),
                SkillRow.builder().group("Furtividade").build())).build();

        ObjectNode delta = calculator.diff(last, proposed);

        assertTrue(delta.at("/skills/Armas Brancas/atkGasto/last").isNull());
        assertEquals(5, delta.at("/skills/Armas Brancas/atkGasto/new").asInt());
        assertTrue(delta.at("/skills/Furtividade").isMissingNode());
    }

    @Test
    void treatsNullBaseSheetAsEmpty() {
        ObjectNode delta = calculator.diff(null, CharacterSheet.builder().level(2).build());
        assertEquals(2, delta.at("/level/new").asInt());
    }
}
