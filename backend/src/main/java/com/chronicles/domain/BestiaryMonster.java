package com.chronicles.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bestiary_monsters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BestiaryMonster {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "campaign_id")
    private UUID campaignId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 60)
    @Builder.Default
    private String category = "MONSTRO";

    @Column(nullable = false)
    @Builder.Default
    private Integer pv = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer ip = 0;

    @Column(length = 50)
    private String movement;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private java.util.Map<String, Object> attributes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private java.util.List<Object> abilities;

    @Column(name = "portrait_url", columnDefinition = "TEXT")
    private String portraitUrl;

    @Column(name = "is_official", nullable = false)
    @Builder.Default
    private Boolean isOfficial = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
