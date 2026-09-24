package com.chronicles.repository;

import com.chronicles.domain.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, UUID> {
    List<Campaign> findAllByDmId(UUID dmId);
    Optional<Campaign> findByInviteCode(String inviteCode);

    @Query("SELECT DISTINCT c FROM Campaign c LEFT JOIN c.players p WHERE c.dm.id = :userId OR p.user.id = :userId")
    List<Campaign> findAllForUser(@Param("userId") UUID userId);
}
