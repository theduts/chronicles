package com.chronicles.repository;

import com.chronicles.domain.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContractRepository extends JpaRepository<Contract, UUID> {
    List<Contract> findAllByCampaignIdOrderByCreatedAtDesc(UUID campaignId);
    List<Contract> findAllByCampaignIdAndStatusOrderByCreatedAtDesc(UUID campaignId, String status);
}
