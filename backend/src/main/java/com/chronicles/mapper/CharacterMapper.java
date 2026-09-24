package com.chronicles.mapper;

import com.chronicles.domain.Character;
import com.chronicles.domain.jsonb.CharacterSheet;
import com.chronicles.dto.character.CharacterRequest;
import com.chronicles.dto.character.CharacterResponse;
import org.springframework.stereotype.Component;

@Component
public class CharacterMapper {

    public CharacterResponse toResponse(Character character) {
        if (character == null) return null;
        CharacterSheet sheet = character.getSheet();
        if (sheet == null) sheet = new CharacterSheet();

        return CharacterResponse.builder()
                .id(character.getId())
                .name(character.getName())
                .race(character.getRace())
                .classKit(character.getClassKit())
                .level(character.getCurrentLevel())
                .xp(character.getXp())
                .portraitUrl(character.getPortraitUrl())
                .isPendingDMReview(character.getIsPendingReview())
                .pendingChanges(character.getProposedSheet())
                .campaignId(character.getCampaignId())
                .userId(character.getUser() != null ? character.getUser().getId() : null)
                // Fields from sheet
                .sex(sheet.getSex())
                .weight(sheet.getWeight())
                .height(sheet.getHeight())
                .age(sheet.getAge())
                .attributes(sheet.getAttributes())
                .statusPoints(sheet.getStatusPoints())
                .protection(sheet.getProtection())
                .aprimoramentosPositivos(sheet.getAprimoramentosPositivos())
                .aprimoramentosNegativos(sheet.getAprimoramentosNegativos())
                .descricaoEfeitos(sheet.getDescricaoEfeitos())
                .campaignGenres(sheet.getCampaignGenres())
                .skills(sheet.getSkills())
                .treasure(sheet.getTreasure())
                .items(sheet.getItems())
                .background(sheet.getBackground())
                .isMagic(sheet.getIsMagic())
                .hasPendingMagicEnchant(sheet.getHasPendingMagicEnchant())
                .spells(sheet.getSpells())
                .alinhamento(sheet.getAlinhamento())
                .focusAllocation(sheet.getFocusAllocation())
                .armors(sheet.getArmors())
                .armaPreferencialVinculo(sheet.getArmaPreferencialVinculo())
                .companionAnimal(sheet.getCompanionAnimal())
                .montariaEspecial(sheet.getMontariaEspecial())
                .familiar(sheet.getFamiliar())
                .build();
    }

    public CharacterSheet extractSheet(CharacterRequest request) {
        if (request == null) return new CharacterSheet();

        return CharacterSheet.builder()
                .sex(request.getSex())
                .weight(request.getWeight())
                .height(request.getHeight())
                .age(request.getAge())
                .attributes(request.getAttributes())
                .statusPoints(request.getStatusPoints())
                .protection(request.getProtection())
                .aprimoramentosPositivos(request.getAprimoramentosPositivos())
                .aprimoramentosNegativos(request.getAprimoramentosNegativos())
                .descricaoEfeitos(request.getDescricaoEfeitos())
                .campaignGenres(request.getCampaignGenres())
                .skills(request.getSkills())
                .treasure(request.getTreasure())
                .items(request.getItems())
                .background(request.getBackground())
                .isMagic(request.getIsMagic())
                .hasPendingMagicEnchant(request.getHasPendingMagicEnchant())
                .spells(request.getSpells())
                .alinhamento(request.getAlinhamento())
                .focusAllocation(request.getFocusAllocation())
                .armors(request.getArmors())
                .armaPreferencialVinculo(request.getArmaPreferencialVinculo())
                .companionAnimal(request.getCompanionAnimal())
                .montariaEspecial(request.getMontariaEspecial())
                .familiar(request.getFamiliar())
                .build();
    }
}
