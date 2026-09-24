package com.chronicles.repository;

import com.chronicles.domain.SystemRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SystemRuleRepository extends JpaRepository<SystemRule, UUID> {
    Optional<SystemRule> findBySystemSlugAndRuleKey(String systemSlug, String ruleKey);
    List<SystemRule> findAllBySystemSlug(String systemSlug);
}
