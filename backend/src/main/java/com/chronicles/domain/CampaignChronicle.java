package com.chronicles.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "campaign_chronicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaignChronicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "session_number", nullable = false)
    private Integer sessionNumber;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "session_date", nullable = false)
    @Builder.Default
    private LocalDate sessionDate = LocalDate.now();

    @Column(length = 150)
    private String location;

    @Column(length = 255)
    private String mission;

    @Column(name = "illustration_url", columnDefinition = "TEXT")
    private String illustrationUrl;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String narrative;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
