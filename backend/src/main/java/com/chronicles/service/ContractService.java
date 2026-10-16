package com.chronicles.service;

import com.chronicles.domain.Campaign;
import com.chronicles.domain.Contract;
import com.chronicles.domain.Role;
import com.chronicles.domain.User;
import com.chronicles.dto.contract.ContractRequest;
import com.chronicles.dto.contract.ContractResponse;
import com.chronicles.repository.CampaignPlayerRepository;
import com.chronicles.repository.CampaignRepository;
import com.chronicles.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final CampaignRepository campaignRepository;
    private final CampaignPlayerRepository campaignPlayerRepository;

    @Transactional(readOnly = true)
    public List<ContractResponse> getContracts(UUID campaignId, String status, User user) {
        validateCampaignAccess(campaignId, user, false);

        List<Contract> contracts;
        if (status != null && !status.isBlank()) {
            contracts = contractRepository.findAllByCampaignIdAndStatusOrderByCreatedAtDesc(campaignId, status.toUpperCase());
        } else {
            contracts = contractRepository.findAllByCampaignIdOrderByCreatedAtDesc(campaignId);
        }

        return contracts.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ContractResponse getContractById(UUID id, User user) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado"));
        validateCampaignAccess(contract.getCampaign().getId(), user, false);
        return toResponse(contract);
    }

    @Transactional
    public ContractResponse createContract(ContractRequest request, User user) {
        Campaign campaign = validateCampaignAccess(request.getCampaignId(), user, true);

        Contract contract = Contract.builder()
                .campaign(campaign)
                .createdBy(user)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "AVAILABLE")
                .hasReward(Boolean.TRUE.equals(request.getHasReward()))
                .rewardValue(request.getRewardValue())
                .currency(request.getCurrency())
                .rewardItem(request.getRewardItem())
                .build();

        Contract saved = contractRepository.save(contract);
        return toResponse(saved);
    }

    @Transactional
    public ContractResponse updateContract(UUID id, ContractRequest request, User user) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado"));
        validateCampaignAccess(contract.getCampaign().getId(), user, true);

        contract.setTitle(request.getTitle().trim());
        contract.setDescription(request.getDescription());
        if (request.getStatus() != null) contract.setStatus(request.getStatus().toUpperCase());
        if (request.getHasReward() != null) contract.setHasReward(request.getHasReward());
        if (request.getRewardValue() != null) contract.setRewardValue(request.getRewardValue());
        if (request.getCurrency() != null) contract.setCurrency(request.getCurrency());
        if (request.getRewardItem() != null) contract.setRewardItem(request.getRewardItem());

        Contract saved = contractRepository.save(contract);
        return toResponse(saved);
    }

    @Transactional
    public void deleteContract(UUID id, User user) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado"));
        validateCampaignAccess(contract.getCampaign().getId(), user, true);

        contractRepository.delete(contract);
    }

    private Campaign validateCampaignAccess(UUID campaignId, User user, boolean dmOnly) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campanha não encontrada"));

        boolean isDm = campaign.getDm().getId().equals(user.getId()) || user.getRole() == Role.ROLE_ADMIN;

        if (dmOnly) {
            if (!isDm) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o Mestre pode realizar esta operação");
            }
            return campaign;
        }

        if (!isDm && !campaignPlayerRepository.existsByCampaignIdAndUserId(campaignId, user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não participa desta campanha");
        }
        return campaign;
    }

    private ContractResponse toResponse(Contract contract) {
        return ContractResponse.builder()
                .id(contract.getId())
                .campaignId(contract.getCampaign().getId())
                .createdById(contract.getCreatedBy().getId())
                .title(contract.getTitle())
                .description(contract.getDescription())
                .status(contract.getStatus())
                .hasReward(contract.getHasReward())
                .rewardValue(contract.getRewardValue())
                .currency(contract.getCurrency())
                .rewardItem(contract.getRewardItem())
                .createdAt(contract.getCreatedAt())
                .updatedAt(contract.getUpdatedAt())
                .build();
    }
}
