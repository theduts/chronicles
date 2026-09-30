package com.chronicles.service;

import com.chronicles.domain.SystemRule;
import com.chronicles.repository.SystemRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RuleService {

    private final SystemRuleRepository systemRuleRepository;

    @Transactional(readOnly = true)
    public Object getRuleData(String systemSlug, String ruleKey) {
        SystemRule rule = systemRuleRepository.findBySystemSlugAndRuleKey(systemSlug, ruleKey)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Regra não encontrada: " + ruleKey));
        return rule.getData();
    }

    @Transactional(readOnly = true)
    public SystemRule getRule(String systemSlug, String ruleKey) {
        return systemRuleRepository.findBySystemSlugAndRuleKey(systemSlug, ruleKey)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Regra não encontrada: " + ruleKey));
    }

    @Transactional(readOnly = true)
    public List<SystemRule> getAllRules(String systemSlug) {
        return systemRuleRepository.findAllBySystemSlug(systemSlug);
    }
}
