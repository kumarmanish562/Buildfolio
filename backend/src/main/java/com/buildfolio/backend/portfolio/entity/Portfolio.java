package com.buildfolio.backend.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "portfolios",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"repository_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "repository_id", nullable = false)
    private UUID repositoryId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "tech_stack", nullable = false, columnDefinition = "TEXT")
    private String techStack;

    @Column(name = "architecture_overview", nullable = false, columnDefinition = "TEXT")
    private String architectureOverview;

    @Column(name = "mermaid_diagram", columnDefinition = "TEXT")
    private String mermaidDiagram;

    @Column(name = "key_features", nullable = false, columnDefinition = "TEXT")
    private String keyFeatures;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private boolean isPublic = false;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
