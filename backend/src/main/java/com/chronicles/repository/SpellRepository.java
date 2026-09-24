package com.chronicles.repository;

import com.chronicles.domain.Spell;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpellRepository extends JpaRepository<Spell, UUID> {
    List<Spell> findAllBySystemSlugOrderByNameAsc(String systemSlug);

    @Query("SELECT s FROM Spell s WHERE s.systemSlug = :systemSlug AND LOWER(s.schoolOrFocus) = LOWER(:schoolOrFocus) ORDER BY s.name ASC")
    List<Spell> findAllBySystemSlugAndSchoolOrFocus(@Param("systemSlug") String systemSlug, @Param("schoolOrFocus") String schoolOrFocus);
}
