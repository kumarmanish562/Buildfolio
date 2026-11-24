package com.buildfolio.backend;

import com.buildfolio.backend.common.exception.BadRequestException;
import com.buildfolio.backend.common.exception.NotFoundException;
import com.buildfolio.backend.portfolio.dto.PortfolioResponse;
import com.buildfolio.backend.portfolio.entity.Portfolio;
import com.buildfolio.backend.portfolio.repository.PortfolioRepository;
import com.buildfolio.backend.portfolio.service.PortfolioService;
import com.buildfolio.backend.repo.entity.IndexStatus;
import com.buildfolio.backend.repo.entity.Repository;
import com.buildfolio.backend.repo.service.RepoService;
import com.buildfolio.backend.chat.service.ai.CodeContextRetriever;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.model.ChatModel;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {

    @Mock
    private PortfolioRepository portfolioRepository;

    @Mock
    private RepoService repoService;

    @Mock
    private CodeContextRetriever codeContextRetriever;

    @Mock
    private ChatModel chatModel;

    private ObjectMapper objectMapper;
    private PortfolioService portfolioService;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        portfolioService = new PortfolioService(
                portfolioRepository,
                repoService,
                codeContextRetriever,
                chatModel,
                objectMapper
        );
    }

    @Test
    void testGetPortfolio_Success() {
        UUID repoId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Repository repo = Repository.builder()
                .id(repoId)
                .userId(userId)
                .name("test-repo")
                .fullName("user/test-repo")
                .htmlUrl("https://github.com/user/test-repo")
                .build();

        Portfolio portfolio = Portfolio.builder()
                .id(UUID.randomUUID())
                .repositoryId(repoId)
                .userId(userId)
                .title("Test Portfolio")
                .summary("Test Summary")
                .techStack("[]")
                .architectureOverview("Overview")
                .mermaidDiagram("flowchart TD")
                .keyFeatures("[]")
                .isPublic(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(repoService.requireOwned(repoId, userId)).thenReturn(repo);
        when(portfolioRepository.findByRepositoryId(repoId)).thenReturn(Optional.of(portfolio));

        PortfolioResponse response = portfolioService.getPortfolio(repoId, userId);

        assertNotNull(response);
        assertEquals("Test Portfolio", response.title());
        assertEquals("user/test-repo", response.repositoryFullName());
        assertTrue(response.isPublic());
    }

    @Test
    void testGetPortfolio_NotFoundThrowsException() {
        UUID repoId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Repository repo = Repository.builder()
                .id(repoId)
                .userId(userId)
                .name("test-repo")
                .fullName("user/test-repo")
                .build();

        when(repoService.requireOwned(repoId, userId)).thenReturn(repo);
        when(portfolioRepository.findByRepositoryId(repoId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> portfolioService.getPortfolio(repoId, userId));
    }

    @Test
    void testGeneratePortfolio_RequiresReadyStatus() {
        UUID repoId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Repository repo = Repository.builder()
                .id(repoId)
                .userId(userId)
                .name("test-repo")
                .fullName("user/test-repo")
                .indexStatus(IndexStatus.INDEXING)
                .build();

        when(repoService.requireOwned(repoId, userId)).thenReturn(repo);

        assertThrows(BadRequestException.class, () -> portfolioService.generatePortfolio(repoId, userId));
    }

    @Test
    void testUpdateVisibility_Success() {
        UUID repoId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Repository repo = Repository.builder()
                .id(repoId)
                .userId(userId)
                .name("test-repo")
                .fullName("user/test-repo")
                .build();

        Portfolio portfolio = Portfolio.builder()
                .id(UUID.randomUUID())
                .repositoryId(repoId)
                .userId(userId)
                .title("Test Portfolio")
                .summary("Test Summary")
                .techStack("[]")
                .architectureOverview("Overview")
                .mermaidDiagram("flowchart TD")
                .keyFeatures("[]")
                .isPublic(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        when(repoService.requireOwned(repoId, userId)).thenReturn(repo);
        when(portfolioRepository.findByRepositoryId(repoId)).thenReturn(Optional.of(portfolio));
        when(portfolioRepository.save(any(Portfolio.class))).thenAnswer(i -> i.getArgument(0));

        PortfolioResponse response = portfolioService.updateVisibility(repoId, userId, true);

        assertNotNull(response);
        assertTrue(response.isPublic());
        verify(portfolioRepository).save(portfolio);
    }

    @Test
    void testGetPublicPortfolio_WhenNotPublic_ThrowsNotFound() {
        UUID portfolioId = UUID.randomUUID();
        when(portfolioRepository.findByIdAndIsPublicTrue(portfolioId)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> portfolioService.getPublicPortfolio(portfolioId));
    }
}
