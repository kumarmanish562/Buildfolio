package com.buildfolio.backend.services;

import com.buildfolio.backend.dto.IndexStatusResponse;
import com.buildfolio.backend.dto.RepositoryResponse;
import com.buildfolio.backend.entity.Repository;
import com.buildfolio.backend.entity.User;
import com.buildfolio.backend.exceptions.NotFoundException;
import com.buildfolio.backend.repository.RepositoryRepository;
import com.buildfolio.backend.services.github.GithubApiClient;
import com.buildfolio.backend.services.indexing.IndexingService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RepoService {

    private final RepositoryRepository repositoryRepository;
    private final UserService userService;
    private final GithubApiClient gitHubApiClient;
    private final IndexingService indexingService;

    @Transactional
    public List<RepositoryResponse> syncAndListRepos(UUID userId) {

        User user = userService.requiredById(userId);

        String token =
                userService.decryptAccessToken(user);

        List<Map<String, Object>> remoteRepos =
                gitHubApiClient.listUserRepos(token);

        List<Repository> saved = new ArrayList<>();

        for (Map<String, Object> remote : remoteRepos) {

            Long githubRepoId =
                    toLong(remote.get("id"));

            Repository repo =
                    repositoryRepository
                            .findByUserIdAndGithubRepoId(
                                    userId,
                                    githubRepoId
                            )
                            .orElseGet(Repository::new);

            String fullName =
                    String.valueOf(remote.get("full_name"));

            String[] parts =
                    fullName.split("/", 2);

            String owner =
                    parts.length > 0
                            ? parts[0]
                            : "";

            String name =
                    parts.length > 1
                            ? parts[1]
                            : String.valueOf(
                            remote.get("name")
                    );

            if (owner.isBlank()) {

                Object ownerObj =
                        remote.get("owner");

                if (ownerObj instanceof Map<?, ?> ownerMap
                        && ownerMap.get("login") != null) {

                    owner =
                            String.valueOf(
                                    ownerMap.get("login")
                            );
                }
            }

            repo.setUserId(userId);
            repo.setGithubRepoId(githubRepoId);
            repo.setOwner(owner);
            repo.setName(name);
            repo.setFullName(fullName);

            repo.setPrivate(
                    Boolean.TRUE.equals(
                            remote.get("private")
                    )
            );

            repo.setDefaultBranch(
                    remote.get("default_branch") != null
                            ? String.valueOf(
                            remote.get("default_branch")
                    )
                            : "main"
            );

            repo.setLanguage(
                    remote.get("language") != null
                            ? String.valueOf(
                            remote.get("language")
                    )
                            : null
            );

            repo.setHtmlUrl(
                    remote.get("html_url") != null
                            ? String.valueOf(
                            remote.get("html_url")
                    )
                            : null
            );

            repo.setDescription(
                    remote.get("description") != null
                            ? String.valueOf(
                            remote.get("description")
                    )
                            : null
            );

            saved.add(
                    repositoryRepository.save(repo)
            );
        }

        return saved.stream()
                .sorted(
                        (a, b) ->
                                a.getFullName()
                                        .compareToIgnoreCase(
                                                b.getFullName()
                                        )
                )
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RepositoryResponse> listStored(
            UUID userId
    ) {

        return repositoryRepository
                .findByUserIdOrderByFullNameAsc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Repository requireOwned(
            UUID repoId,
            UUID userId
    ) {

        return repositoryRepository
                .findByIdAndUserId(repoId, userId)
                .orElseThrow(
                        () -> new NotFoundException(
                                "Repository not found"
                        )
                );
    }

    @Transactional(readOnly = true)
    public IndexStatusResponse status(
            UUID repoId,
            UUID userId
    ) {

        Repository repo =
                requireOwned(repoId, userId);

        return new IndexStatusResponse(
                repo.getId(),
                repo.getIndexStatus(),
                repo.getFilesTotal(),
                repo.getFilesProcessed(),
                repo.getChunkCount(),
                repo.getIndexedAt(),
                repo.getErrorMessage()
        );
    }

    /**
     * Delete repository and all its vector embeddings.
     */
    @Transactional
    public void deleteRepository(
            UUID repoId,
            UUID userId
    ) {

        Repository repo =
                requireOwned(repoId, userId);

        indexingService.deleteVectors(
                repo.getId().toString()
        );

        repositoryRepository.delete(repo);
    }

    public RepositoryResponse toResponse(
            Repository repo
    ) {

        return new RepositoryResponse(
                repo.getId(),
                repo.getGithubRepoId(),
                repo.getOwner(),
                repo.getName(),
                repo.getFullName(),
                repo.isPrivate(),
                repo.getDefaultBranch(),
                repo.getLanguage(),
                repo.getHtmlUrl(),
                repo.getDescription(),
                repo.getIndexStatus(),
                repo.getIndexedAt(),
                repo.getChunkCount(),
                repo.getFilesTotal(),
                repo.getFilesProcessed(),
                repo.getErrorMessage()
        );
    }

    private static Long toLong(Object value) {

        if (value instanceof Number number) {
            return number.longValue();
        }

        return Long.parseLong(
                String.valueOf(value)
        );
    }
}