package com.chronicles.controller;

import com.chronicles.domain.SystemRule;
import com.chronicles.service.RuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
@Tag(name = "Rules", description = "Endpoints para consulta do compêndio de regras oficiais do sistema")
public class RuleController {

    private final RuleService ruleService;

    @GetMapping("/{ruleKey}")
    @Operation(summary = "Obter dados de uma regra oficial", description = "Retorna os dados oficiais de uma regra do sistema padrão (daemon).")
    public ResponseEntity<Object> getRule(@PathVariable String ruleKey) {
        return ResponseEntity.ok(ruleService.getRuleData("daemon", ruleKey));
    }

    @GetMapping("/{systemSlug}/{ruleKey}")
    @Operation(summary = "Obter regra por sistema e chave", description = "Retorna os dados de uma regra por sistema e chave específica.")
    public ResponseEntity<Object> getRuleBySlugAndKey(
            @PathVariable String systemSlug,
            @PathVariable String ruleKey
    ) {
        return ResponseEntity.ok(ruleService.getRuleData(systemSlug, ruleKey));
    }

    @GetMapping
    @Operation(summary = "Listar todas as regras", description = "Retorna todas as regras registradas para o sistema padrão.")
    public ResponseEntity<List<SystemRule>> getAllRules(
            @RequestParam(defaultValue = "daemon") String systemSlug
    ) {
        return ResponseEntity.ok(ruleService.getAllRules(systemSlug));
    }
}
