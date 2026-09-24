package com.chronicles.domain;

import com.chronicles.domain.jsonb.CharacterSheet;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "characters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Character {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "campaign_id")
    private UUID campaignId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 60)
    private String race;

    @Column(name = "class_kit", length = 80)
    private String classKit;

    @Column(name = "current_level", nullable = false)
    @Builder.Default
    private Integer currentLevel = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer xp = 0;

    @Column(name = "portrait_url", columnDefinition = "TEXT")
    private String portraitUrl;

    @Column(name = "is_pending_review", nullable = false)
    @Builder.Default
    private Boolean isPendingReview = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "proposed_sheet", columnDefinition = "jsonb")
    private CharacterSheet proposedSheet;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sheet_last_level", columnDefinition = "jsonb")
    private CharacterSheet sheetLastLevel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "sheet", columnDefinition = "jsonb", nullable = false)
    private CharacterSheet sheet;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
