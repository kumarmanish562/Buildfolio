package com.buildfolio.backend.portfolio.service;

import com.buildfolio.backend.auth.service.UserService;
import com.buildfolio.backend.chat.service.ai.CodeContextRetriever;
import com.buildfolio.backend.common.exception.BadRequestException;
import com.buildfolio.backend.common.exception.NotFoundException;
import com.buildfolio.backend.indexing.service.github.GithubApiClient;
import com.buildfolio.backend.portfolio.dto.CreatePullRequestResponse;
import com.buildfolio.backend.portfolio.dto.PortfolioResponse;
import com.buildfolio.backend.portfolio.entity.Portfolio;
import com.buildfolio.backend.portfolio.repository.PortfolioRepository;
import com.buildfolio.backend.repo.entity.IndexStatus;
import com.buildfolio.backend.repo.entity.Repository;
import com.buildfolio.backend.repo.service.RepoService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final RepoService repoService;
    private final UserService userService;
    private final GithubApiClient githubApiClient;
    private final CodeContextRetriever codeContextRetriever;
    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    @Transactional
    public PortfolioResponse generatePortfolio(UUID repoId, UUID userId) {
        Repository repo = repoService.requireOwned(repoId, userId);
        if (repo.getIndexStatus() != IndexStatus.READY) {
            throw new BadRequestException("Repository must be indexed before generating a portfolio showcase");
        }

        var archContext = codeContextRetriever.retrieve(repo.getId(), "architecture system overview components dependencies frameworks");
        var featureContext = codeContextRetriever.retrieve(repo.getId(), "controllers endpoints key features public APIs data models");

        String combinedContext = archContext.contextText() + "\n\n---\n\n" + featureContext.contextText();

        String systemPrompt = """
                You are BuildFolio's Chief Software Architect and Technical Portfolio Writer.
                Your task is to analyze the indexed codebase for the repository %s and synthesize a production-grade developer portfolio and architectural showcase.

                STRICT INSTRUCTIONS:
                1. Respond ONLY with a valid JSON object matching the required schema. Do NOT include any markdown code fences (like ```json), commentary, or extra text.
                2. Base your analysis strictly on the provided codebase context. Do not invent technologies or modules.
                3. The mermaidDiagram field MUST be a valid Mermaid graph/flowchart (e.g. starting with "flowchart TD\\n").
                4. The techStack field MUST be a JSON array string of categories, e.g. "[{\\"category\\":\\"Backend\\",\\"items\\":[\\"Spring Boot\\",\\"Java 21\\"]},{\\"category\\":\\"Database\\",\\"items\\":[\\"PostgreSQL\\",\\"PGVector\\"]}]".
                5. The keyFeatures field MUST be a JSON array string of bullet points, e.g. "[\\"GitHub OAuth authentication\\",\\"Semantic code vector search\\"]".

                JSON SCHEMA:
                {
                  "title": "Clean concise title for this project showcase",
                  "summary": "2-3 paragraphs high-impact executive and technical summary explaining the problem it solves, how it works, and key technical highlights.",
                  "techStack": "[{\\"category\\":\\"...\\",\\"items\\":[...]}, ...]",
                  "architectureOverview": "Detailed technical overview of layers, components, data flow, and design patterns used.",
                  "mermaidDiagram": "flowchart TD\\n  ...",
                  "keyFeatures": "[\\"Feature 1\\", \\"Feature 2\\", ...]"
                }
                """.formatted(repo.getFullName());

        String userPrompt = """
                <repository_name>%s</repository_name>
                <description>%s</description>
                <language>%s</language>

                <code_context>
                %s
                </code_context>

                Generate the developer portfolio showcase JSON now.
                """.formatted(
                repo.getFullName(),
                repo.getDescription() != null ? repo.getDescription() : "",
                repo.getLanguage() != null ? repo.getLanguage() : "",
                combinedContext
        );

        String rawResponse = ChatClient.builder(chatModel)
                .build()
                .prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .content();

        ParsedPortfolio parsed = parsePortfolioJson(rawResponse, repo);

        Portfolio portfolio = portfolioRepository.findByRepositoryId(repo.getId())
                .orElseGet(() -> Portfolio.builder()
                        .repositoryId(repo.getId())
                        .userId(userId)
                        .isPublic(false)
                        .build());

        portfolio.setTitle(parsed.title());
        portfolio.setSummary(parsed.summary());
        portfolio.setTechStack(parsed.techStack());
        portfolio.setArchitectureOverview(parsed.architectureOverview());
        portfolio.setMermaidDiagram(parsed.mermaidDiagram());
        portfolio.setKeyFeatures(parsed.keyFeatures());
        portfolio.setUpdatedAt(Instant.now());

        portfolio = portfolioRepository.save(portfolio);
        log.info("Generated portfolio showcase for repo {}", repo.getFullName());
        return toResponse(portfolio, repo);
    }

    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolio(UUID repoId, UUID userId) {
        Repository repo = repoService.requireOwned(repoId, userId);
        Portfolio portfolio = portfolioRepository.findByRepositoryId(repo.getId())
                .orElseThrow(() -> new NotFoundException("Portfolio not found for this repository. Please generate one first."));
        return toResponse(portfolio, repo);
    }

    @Transactional
    public PortfolioResponse updateVisibility(UUID repoId, UUID userId, boolean isPublic) {
        Repository repo = repoService.requireOwned(repoId, userId);
        Portfolio portfolio = portfolioRepository.findByRepositoryId(repo.getId())
                .orElseThrow(() -> new NotFoundException("Portfolio not found for this repository"));
        portfolio.setPublic(isPublic);
        portfolio.setUpdatedAt(Instant.now());
        portfolio = portfolioRepository.save(portfolio);
        return toResponse(portfolio, repo);
    }

    @Transactional(readOnly = true)
    public PortfolioResponse getPublicPortfolio(UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findByIdAndIsPublicTrue(portfolioId)
                .orElseThrow(() -> new NotFoundException("Public portfolio showcase not found or is set to private"));
        Repository repo = repoService.findById(portfolio.getRepositoryId())
                .orElseThrow(() -> new NotFoundException("Associated repository not found"));
        return toResponse(portfolio, repo);
    }

    @Transactional
    public void deletePortfolio(UUID repoId, UUID userId) {
        Repository repo = repoService.requireOwned(repoId, userId);
        portfolioRepository.findByRepositoryId(repo.getId())
                .ifPresent(portfolioRepository::delete);
    }

    @Transactional(readOnly = true)
    public CreatePullRequestResponse createArchitecturePullRequest(UUID repoId, UUID userId) {
        Repository repo = repoService.requireOwned(repoId, userId);
        Portfolio portfolio = portfolioRepository.findByRepositoryId(repo.getId())
                .orElseThrow(() -> new NotFoundException("Portfolio not found. Generate portfolio before exporting PR."));

        String token = userService.decryptAccessToken(userService.requiredById(userId));
        String baseBranch = repo.getDefaultBranch() != null ? repo.getDefaultBranch() : "main";
        String newBranch = "buildfolio-docs-" + System.currentTimeMillis() % 10000;

        // 1. Get base branch SHA
        Map<String, Object> baseRef = githubApiClient.getRef(token, repo.getOwner(), repo.getName(), "heads/" + baseBranch);
        @SuppressWarnings("unchecked")
        Map<String, Object> objectMap = (Map<String, Object>) baseRef.get("object");
        if (objectMap == null || objectMap.get("sha") == null) {
            throw new BadRequestException("Could not retrieve SHA for base branch: " + baseBranch);
        }
        String baseSha = objectMap.get("sha").toString();

        // 2. Create new branch ref
        githubApiClient.createRef(token, repo.getOwner(), repo.getName(), "refs/heads/" + newBranch, baseSha);

        // 3. Format docs/ARCHITECTURE.md content
        String docContent = """
                # Architecture & Technical Documentation: %s
                
                Generated automatically by **[Buildfolio](https://github.com/kumarmanish562/Buildfolio)**.
                
                ## Executive Summary
                %s
                
                ## Architecture Overview
                %s
                
                ```mermaid
                %s
                ```
                
                ## Key Features
                %s
                
                ## Tech Stack
                %s
                """.formatted(
                portfolio.getTitle(),
                portfolio.getSummary(),
                portfolio.getArchitectureOverview(),
                portfolio.getMermaidDiagram(),
                portfolio.getKeyFeatures(),
                portfolio.getTechStack()
        );

        // 4. Commit file to new branch
        githubApiClient.createOrUpdateFile(
                token, repo.getOwner(), repo.getName(),
                "docs/ARCHITECTURE.md",
                "docs: add system architecture and portfolio showcase",
                docContent,
                newBranch
        );

        // 5. Open Pull Request
        Map<String, Object> prResult = githubApiClient.createPullRequest(
                token, repo.getOwner(), repo.getName(),
                "docs: add system architecture documentation",
                newBranch,
                baseBranch,
                "### Buildfolio Automated Documentation Pull Request\n\nThis PR adds `docs/ARCHITECTURE.md` including executive summary, architecture overview, and Mermaid diagram."
        );

        String prUrl = prResult.getOrDefault("html_url", repo.getHtmlUrl() + "/pulls").toString();
        int prNumber = prResult.get("number") instanceof Number n ? n.intValue() : 1;

        return new CreatePullRequestResponse(
                prUrl,
                prNumber,
                newBranch,
                "Pull request created successfully"
        );
    }

    private ParsedPortfolio parsePortfolioJson(String rawResponse, Repository repo) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return fallbackPortfolio(repo);
        }

        String cleaned = rawResponse.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        cleaned = cleaned.trim();

        try {
            JsonNode root = objectMapper.readTree(cleaned);
            String title = root.hasNonNull("title") ? root.get("title").asText() : repo.getName() + " Showcase";
            String summary = root.hasNonNull("summary") ? root.get("summary").asText() : "A project built with " + repo.getLanguage();

            String techStack = root.hasNonNull("techStack")
                    ? (root.get("techStack").isTextual() ? root.get("techStack").asText() : root.get("techStack").toString())
                    : "[{\"category\":\"Language\",\"items\":[\"" + (repo.getLanguage() != null ? repo.getLanguage() : "General") + "\"]}]";

            String architecture = root.hasNonNull("architectureOverview") ? root.get("architectureOverview").asText() : "Standard layered architecture.";
            String mermaid = root.hasNonNull("mermaidDiagram") ? root.get("mermaidDiagram").asText() : defaultMermaidDiagram(repo);

            String keyFeatures = root.hasNonNull("keyFeatures")
                    ? (root.get("keyFeatures").isTextual() ? root.get("keyFeatures").asText() : root.get("keyFeatures").toString())
                    : "[\"Modular architecture\", \"Production-ready code organization\"]";

            return new ParsedPortfolio(title, summary, techStack, architecture, mermaid, keyFeatures);
        } catch (Exception e) {
            log.warn("Failed to parse LLM portfolio JSON, using fallback parsing: {}", e.getMessage());
            return fallbackPortfolio(repo);
        }
    }

    private ParsedPortfolio fallbackPortfolio(Repository repo) {
        return new ParsedPortfolio(
                repo.getName() + " Portfolio & Technical Showcase",
                (repo.getDescription() != null && !repo.getDescription().isBlank())
                        ? repo.getDescription()
                        : "Technical showcase for " + repo.getFullName() + ", a " + repo.getLanguage() + " repository.",
                "[{\"category\":\"Language\",\"items\":[\"" + (repo.getLanguage() != null ? repo.getLanguage() : "Multi-language") + "\"]}]",
                "The repository follows modern software engineering best practices with modular packaging and clean layer separation.",
                defaultMermaidDiagram(repo),
                "[\"Clean layered architecture\", \"Automated CI/CD compatibility\", \"Extensible codebase\"]"
        );
    }

    private String defaultMermaidDiagram(Repository repo) {
        return "flowchart TD\n" +
                "  Client[Client / Frontend] --> API[Backend API: " + repo.getName() + "]\n" +
                "  API --> DB[(Database / Storage)]";
    }

    private PortfolioResponse toResponse(Portfolio portfolio, Repository repo) {
        return new PortfolioResponse(
                portfolio.getId(),
                portfolio.getRepositoryId(),
                repo.getName(),
                repo.getFullName(),
                repo.getHtmlUrl(),
                portfolio.getTitle(),
                portfolio.getSummary(),
                portfolio.getTechStack(),
                portfolio.getArchitectureOverview(),
                portfolio.getMermaidDiagram(),
                portfolio.getKeyFeatures(),
                portfolio.isPublic(),
                portfolio.getCreatedAt(),
                portfolio.getUpdatedAt()
        );
    }

    private record ParsedPortfolio(
            String title,
            String summary,
            String techStack,
            String architectureOverview,
            String mermaidDiagram,
            String keyFeatures
    ) {}
}
