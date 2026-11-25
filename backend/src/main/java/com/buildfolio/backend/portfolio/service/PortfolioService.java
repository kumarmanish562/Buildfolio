package com.buildfolio.backend.portfolio.service;

import com.buildfolio.backend.audit.entity.SecurityAudit;
import com.buildfolio.backend.audit.repository.SecurityAuditRepository;
import com.buildfolio.backend.auth.entity.User;
import com.buildfolio.backend.auth.repository.UserRepository;
import com.buildfolio.backend.auth.service.UserService;
import com.buildfolio.backend.chat.service.ai.CodeContextRetriever;
import com.buildfolio.backend.common.exception.BadRequestException;
import com.buildfolio.backend.common.exception.NotFoundException;
import com.buildfolio.backend.indexing.service.github.GithubApiClient;
import com.buildfolio.backend.chat.dto.CitationDto;
import com.buildfolio.backend.portfolio.dto.*;
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
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final SecurityAuditRepository securityAuditRepository;
    private final UserRepository userRepository;
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

    @Transactional(readOnly = true)
    public PublicProfileResponse getPublicProfile(String githubUsername) {
        User user = userRepository.findByGithubUsernameIgnoreCase(githubUsername)
                .orElseThrow(() -> new NotFoundException("Developer profile not found: " + githubUsername));

        List<Portfolio> publicPortfolios = portfolioRepository
                .findByUserIdAndIsPublicTrueOrderByUpdatedAtDesc(user.getId());

        List<PortfolioResponse> portfolioResponses = new ArrayList<>();
        Set<String> techStackSet = new LinkedHashSet<>();
        int securityScoreSum = 0;
        int securityAuditCount = 0;

        for (Portfolio portfolio : publicPortfolios) {
            Optional<Repository> repoOpt = repoService.findById(portfolio.getRepositoryId());
            if (repoOpt.isEmpty()) {
                continue;
            }
            Repository repo = repoOpt.get();
            portfolioResponses.add(toResponse(portfolio, repo));

            // Aggregate tech stack items
            try {
                JsonNode root = objectMapper.readTree(portfolio.getTechStack());
                if (root.isArray()) {
                    for (JsonNode category : root) {
                        JsonNode items = category.get("items");
                        if (items != null && items.isArray()) {
                            for (JsonNode item : items) {
                                String label = item.asText().trim();
                                if (!label.isEmpty()) {
                                    techStackSet.add(label);
                                }
                            }
                        }
                    }
                }
            } catch (Exception e) {
                if (repo.getLanguage() != null && !repo.getLanguage().isBlank()) {
                    techStackSet.add(repo.getLanguage());
                }
            }

            // Aggregate security health score
            Optional<SecurityAudit> auditOpt = securityAuditRepository
                    .findTopByRepositoryIdOrderByCreatedAtDesc(repo.getId());
            if (auditOpt.isPresent()) {
                securityScoreSum += auditOpt.get().getOverallScore();
                securityAuditCount++;
            }
        }

        Integer averageSecurityScore = securityAuditCount > 0
                ? Math.round((float) securityScoreSum / securityAuditCount)
                : null;

        List<String> aggregatedTechStack = techStackSet.stream().limit(30).toList();

        return new PublicProfileResponse(
                user.getGithubUsername(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                "https://github.com/" + user.getGithubUsername(),
                user.getCreatedAt(),
                portfolioResponses.size(),
                averageSecurityScore,
                aggregatedTechStack,
                portfolioResponses
        );
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

        Map<String, Object> baseRef = githubApiClient.getRef(token, repo.getOwner(), repo.getName(), "heads/" + baseBranch);
        @SuppressWarnings("unchecked")
        Map<String, Object> objectMap = (Map<String, Object>) baseRef.get("object");
        if (objectMap == null || objectMap.get("sha") == null) {
            throw new BadRequestException("Could not retrieve SHA for base branch: " + baseBranch);
        }
        String baseSha = objectMap.get("sha").toString();

        githubApiClient.createRef(token, repo.getOwner(), repo.getName(), "refs/heads/" + newBranch, baseSha);

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

        githubApiClient.createOrUpdateFile(
                token, repo.getOwner(), repo.getName(),
                "docs/ARCHITECTURE.md",
                "docs: add system architecture and portfolio showcase",
                docContent,
                newBranch
        );

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

    @Transactional(readOnly = true)
    public RepoComparisonResponse compareRepositories(List<UUID> repoIds, UUID userId) {
        if (repoIds == null || repoIds.isEmpty() || repoIds.size() > 5) {
            throw new BadRequestException("Please select between 1 and 5 repositories to compare");
        }

        List<RepoComparisonItem> items = new ArrayList<>();
        StringBuilder summaryContext = new StringBuilder();

        for (UUID repoId : repoIds) {
            Repository repo = repoService.requireOwned(repoId, userId);
            Optional<Portfolio> portfolioOpt = portfolioRepository.findByRepositoryId(repo.getId());
            Optional<SecurityAudit> auditOpt = securityAuditRepository.findTopByRepositoryIdOrderByCreatedAtDesc(repo.getId());

            List<String> techCats = new ArrayList<>();
            if (portfolioOpt.isPresent()) {
                try {
                    JsonNode node = objectMapper.readTree(portfolioOpt.get().getTechStack());
                    if (node.isArray()) {
                        for (JsonNode cat : node) {
                            if (cat.hasNonNull("category")) {
                                techCats.add(cat.get("category").asText());
                            }
                        }
                    }
                } catch (Exception e) {
                    techCats.add(repo.getLanguage() != null ? repo.getLanguage() : "General");
                }
            }

            RepoComparisonItem item = new RepoComparisonItem(
                    repo.getId(),
                    repo.getName(),
                    repo.getFullName(),
                    repo.getLanguage() != null ? repo.getLanguage() : "Unknown",
                    repo.getIndexStatus().name(),
                    repo.getFilesTotal(),
                    repo.getChunkCount(),
                    portfolioOpt.map(Portfolio::getTitle).orElse("Not Generated"),
                    portfolioOpt.map(Portfolio::getArchitectureOverview).orElse("Standard architecture"),
                    techCats,
                    auditOpt.map(SecurityAudit::getOverallScore).orElse(null),
                    auditOpt.map(SecurityAudit::getRiskLevel).orElse("UNAUDITED")
            );
            items.add(item);

            summaryContext.append("Repo: ").append(repo.getFullName())
                    .append(" | Language: ").append(repo.getLanguage())
                    .append(" | Tech: ").append(String.join(", ", techCats))
                    .append(" | Score: ").append(item.securityScore())
                    .append("\n");
        }

        String crossSummaryPrompt = """
                You are a Principal Enterprise Systems Architect.
                Review the following repositories from a developer's portfolio and provide a concise 2-paragraph comparative architectural analysis, highlighting synergy, common technology patterns, and polyglot balance:
                
                %s
                """.formatted(summaryContext.toString());

        String crossSummary = ChatClient.builder(chatModel)
                .build()
                .prompt(crossSummaryPrompt)
                .call()
                .content();

        return new RepoComparisonResponse(items, crossSummary != null ? crossSummary.trim() : "Comparison matrix synthesized successfully.");
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

    @Transactional(readOnly = true)
    public PublicAskResponse askPublicPortfolio(UUID portfolioId, PublicAskRequest request) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new NotFoundException("Portfolio not found"));

        if (!portfolio.isPublic()) {
            throw new BadRequestException("This portfolio is private and cannot be queried publicly");
        }

        Repository repo = repoService.findById(portfolio.getRepositoryId())
                .orElseThrow(() -> new NotFoundException("Repository not found"));
        var retrieved = codeContextRetriever.retrieve(repo.getId(), request.question());

        String systemPrompt = """
                You are BuildFolio's Technical AI Advocate representing the developer of this repository (%s) in a technical interview with a recruiter, client, or engineering manager.
                
                GUIDELINES:
                1. Answer in the first person ("In this project, I/we designed...", "The architecture uses...").
                2. Provide concrete technical rationale (why specific patterns, frameworks, or database strategies were chosen).
                3. Base your answers strictly on the provided indexed code snippets.
                4. Be concise, authoritative, professional, and highlight software engineering craftsmanship, security posture, and scalability.
                
                CODEBASE CONTEXT:
                %s
                """.formatted(repo.getFullName(), retrieved.contextText());

        String rawAnswer = ChatClient.builder(chatModel)
                .build()
                .prompt()
                .system(systemPrompt)
                .user(request.question())
                .call()
                .content();

        List<CitationDto> citations = retrieved.citations() != null ? retrieved.citations() : List.of();

        return new PublicAskResponse(rawAnswer, citations);
    }

    @Transactional(readOnly = true)
    public SimulateArchitectureResponse simulateArchitecture(
            UUID repoId,
            UUID userId,
            SimulateArchitectureRequest request
    ) {
        Repository repo = repoService.requireOwned(repoId, userId);
        Optional<Portfolio> portfolioOpt = portfolioRepository.findByRepositoryId(repo.getId());

        String currentArchitecture = portfolioOpt.map(Portfolio::getArchitectureOverview).orElse("Layered microservice architecture");
        String currentMermaid = portfolioOpt.map(Portfolio::getMermaidDiagram).orElse(defaultMermaidDiagram(repo));

        String systemPrompt = """
                You are a Principal Enterprise Solutions Architect and Systems Modeler.
                The developer wants to simulate an architectural change scenario for their system: "%s".

                Current Architecture:
                %s

                Current Mermaid Diagram:
                %s

                TASK:
                Analyze the scenario and output a valid JSON object matching the schema below.
                DO NOT output markdown code fences (like ```json), commentary, or extra text.
                The proposedMermaid MUST be a valid Mermaid flowchart TD diagram showing the new components or modified flows.

                JSON SCHEMA:
                {
                  "scenario": "Concise summary of the scenario",
                  "proposedMermaid": "flowchart TD\\n  ...",
                  "tradeOffAnalysis": "Detailed technical analysis of latency, operational cost, reliability, and maintenance trade-offs.",
                  "architecturalImpacts": ["Impact 1 on database", "Impact 2 on network/throughput", "Impact 3 on failure domains"],
                  "estimatedComplexity": "LOW | MEDIUM | HIGH | CRITICAL",
                  "migrationStrategy": "Step-by-step phased roadmap to implement this architectural change safely."
                }
                """.formatted(request.scenarioPrompt(), currentArchitecture, currentMermaid);

        String rawResponse = ChatClient.builder(chatModel)
                .build()
                .prompt()
                .system(systemPrompt)
                .user("Simulate this architectural change now: " + request.scenarioPrompt())
                .call()
                .content();

        try {
            String clean = rawResponse.trim();
            if (clean.startsWith("```json")) clean = clean.substring(7);
            if (clean.startsWith("```")) clean = clean.substring(3);
            if (clean.endsWith("```")) clean = clean.substring(0, clean.length() - 3);
            clean = clean.trim();

            JsonNode root = objectMapper.readTree(clean);
            String scenario = root.path("scenario").asText(request.scenarioPrompt());
            String proposedMermaid = root.path("proposedMermaid").asText(currentMermaid);
            String tradeOffs = root.path("tradeOffAnalysis").asText("Trade-offs analyzed for " + scenario);

            List<String> impacts = new ArrayList<>();
            JsonNode impactsNode = root.path("architecturalImpacts");
            if (impactsNode.isArray()) {
                impactsNode.forEach(i -> impacts.add(i.asText()));
            }
            if (impacts.isEmpty()) {
                impacts.add("Component decoupling and targeted scaling");
                impacts.add("Additional network serialization overhead");
            }

            String complexity = root.path("estimatedComplexity").asText("MEDIUM");
            String strategy = root.path("migrationStrategy").asText("Phase 1: Dual-write or interface abstraction. Phase 2: Canary rollout.");

            return new SimulateArchitectureResponse(scenario, proposedMermaid, tradeOffs, impacts, complexity, strategy);

        } catch (Exception e) {
            log.warn("Failed to parse architectural simulation JSON, using fallback: {}", e.getMessage());
            return new SimulateArchitectureResponse(
                    request.scenarioPrompt(),
                    currentMermaid,
                    "Simulated architectural migration for " + request.scenarioPrompt() + ". Evaluated for resilience, decoupled state, and horizontal scaling capabilities.",
                    List.of(
                            "Database query latency profile adjusted",
                            "Asynchronous decoupled messaging boundary introduced",
                            "Independent deployment and scaling boundaries"
                    ),
                    "MEDIUM",
                    "1. Introduce contract interfaces. 2. Deploy backing services. 3. Route shadow traffic. 4. Cut over active traffic."
            );
        }
    }

    @Transactional(readOnly = true)
    public DependencyGraphResponse getDependencyGraph(UUID repoId, UUID userId) {
        Repository repo = repoService.requireOwned(repoId, userId);
        return buildDependencyGraph(repo);
    }

    @Transactional(readOnly = true)
    public DependencyGraphResponse getPublicDependencyGraph(UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new NotFoundException("Portfolio not found"));
        if (!portfolio.isPublic()) {
            throw new BadRequestException("This portfolio is private");
        }
        Repository repo = repoService.findById(portfolio.getRepositoryId())
                .orElseThrow(() -> new NotFoundException("Repository not found"));
        return buildDependencyGraph(repo);
    }

    private DependencyGraphResponse buildDependencyGraph(Repository repo) {
        var context = codeContextRetriever.retrieve(repo.getId(), "controller service repository entity config model component client");

        Map<String, DependencyGraphResponse.GraphNode> nodeMap = new LinkedHashMap<>();
        List<DependencyGraphResponse.GraphLink> links = new ArrayList<>();

        if (context.citations() != null) {
            for (var citation : context.citations()) {
                String path = citation.filePath();
                if (path == null || path.isBlank()) continue;

                String fileName = path.contains("/") ? path.substring(path.lastIndexOf('/') + 1) : path;
                if (fileName.contains("\\")) fileName = fileName.substring(fileName.lastIndexOf('\\') + 1);

                String name = fileName.contains(".") ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
                String lower = name.toLowerCase();

                String type;
                if (lower.contains("controller") || lower.contains("resource") || lower.contains("endpoint")) {
                    type = "CONTROLLER";
                } else if (lower.contains("service") || lower.contains("manager") || lower.contains("handler")) {
                    type = "SERVICE";
                } else if (lower.contains("repository") || lower.contains("dao")) {
                    type = "REPOSITORY";
                } else if (lower.contains("entity") || lower.contains("model") || lower.contains("dto")) {
                    type = "ENTITY";
                } else if (lower.contains("config") || lower.contains("security")) {
                    type = "CONFIG";
                } else {
                    type = "COMPONENT";
                }

                if (!nodeMap.containsKey(name)) {
                    nodeMap.put(name, new DependencyGraphResponse.GraphNode(
                            name,
                            name,
                            path,
                            type,
                            12 + (name.length() * 2)
                    ));
                }
            }
        }

        // If repo has very few chunks in sample, populate standard architecture nodes
        if (nodeMap.size() < 4) {
            String base = repo.getName().replaceAll("[^a-zA-Z0-9]", "");
            nodeMap.put("AppController", new DependencyGraphResponse.GraphNode("AppController", "AppController", "src/controller/AppController", "CONTROLLER", 24));
            nodeMap.put("CoreService", new DependencyGraphResponse.GraphNode("CoreService", "CoreService", "src/service/CoreService", "SERVICE", 28));
            nodeMap.put("DataRepository", new DependencyGraphResponse.GraphNode("DataRepository", "DataRepository", "src/repository/DataRepository", "REPOSITORY", 22));
            nodeMap.put(base + "Entity", new DependencyGraphResponse.GraphNode(base + "Entity", base + "Entity", "src/entity/" + base + "Entity", "ENTITY", 18));
            nodeMap.put("SecurityConfig", new DependencyGraphResponse.GraphNode("SecurityConfig", "SecurityConfig", "src/config/SecurityConfig", "CONFIG", 20));
        }

        // Build logical dependency links between layers
        List<DependencyGraphResponse.GraphNode> controllers = nodeMap.values().stream().filter(n -> "CONTROLLER".equals(n.type())).toList();
        List<DependencyGraphResponse.GraphNode> services = nodeMap.values().stream().filter(n -> "SERVICE".equals(n.type())).toList();
        List<DependencyGraphResponse.GraphNode> repositories = nodeMap.values().stream().filter(n -> "REPOSITORY".equals(n.type())).toList();
        List<DependencyGraphResponse.GraphNode> entities = nodeMap.values().stream().filter(n -> "ENTITY".equals(n.type())).toList();
        List<DependencyGraphResponse.GraphNode> configs = nodeMap.values().stream().filter(n -> "CONFIG".equals(n.type())).toList();

        for (var c : controllers) {
            for (var s : services) {
                links.add(new DependencyGraphResponse.GraphLink(c.id(), s.id(), "CALLS"));
            }
        }

        for (var s : services) {
            for (var r : repositories) {
                links.add(new DependencyGraphResponse.GraphLink(s.id(), r.id(), "DEPENDS_ON"));
            }
        }

        for (var r : repositories) {
            for (var e : entities) {
                links.add(new DependencyGraphResponse.GraphLink(r.id(), e.id(), "MANAGES"));
            }
        }

        for (var cfg : configs) {
            if (!controllers.isEmpty()) {
                links.add(new DependencyGraphResponse.GraphLink(cfg.id(), controllers.get(0).id(), "CONFIGURES"));
            }
        }

        int totalNodes = nodeMap.size();
        int totalLinks = links.size();

        var metrics = new DependencyGraphResponse.GraphMetrics(
                totalNodes,
                totalLinks,
                controllers.size(),
                services.size(),
                repositories.size(),
                entities.size()
        );

        return new DependencyGraphResponse(new ArrayList<>(nodeMap.values()), links, metrics);
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
