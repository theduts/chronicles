package com.chronicles.controller;

import com.chronicles.domain.User;
import com.chronicles.dto.contract.ContractRequest;
import com.chronicles.dto.contract.ContractResponse;
import com.chronicles.service.ContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@Tag(name = "Contracts", description = "Endpoints para o mural de contratos e missões da campanha")
@SecurityRequirement(name = "bearerAuth")
public class ContractController {

    private final ContractService contractService;

    @GetMapping
    @Operation(summary = "Listar contratos da campanha", description = "Retorna contratos de uma campanha com filtro opcional por status.")
    public ResponseEntity<List<ContractResponse>> getContracts(
            @RequestParam UUID campaignId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(contractService.getContracts(campaignId, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter contrato por ID", description = "Retorna detalhes e recompensas de uma missão.")
    public ResponseEntity<ContractResponse> getContractById(@PathVariable UUID id) {
        return ResponseEntity.ok(contractService.getContractById(id));
    }

    @PostMapping
    @Operation(summary = "Criar novo contrato", description = "Publica uma nova missão no mural da campanha.")
    public ResponseEntity<ContractResponse> createContract(
            @Valid @RequestBody ContractRequest request,
            @AuthenticationPrincipal User user
    ) {
        ContractResponse response = contractService.createContract(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar contrato", description = "Atualiza status e dados de uma missão.")
    public ResponseEntity<ContractResponse> updateContract(
            @PathVariable UUID id,
            @Valid @RequestBody ContractRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(contractService.updateContract(id, request, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir contrato", description = "Remove um contrato do mural.")
    public ResponseEntity<Void> deleteContract(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {
        contractService.deleteContract(id, user);
        return ResponseEntity.noContent().build();
    }
}
