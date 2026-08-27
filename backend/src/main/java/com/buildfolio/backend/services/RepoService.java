package com.buildfolio.backend.services;

import com.buildfolio.backend.dto.IndexStatusResponse;
import com.buildfolio.backend.dto.RepositoryResponse;
import com.buildfolio.backend.entity.Repository;
import com.buildfolio.backend.entity.User;
import com.buildfolio.backend.exceptions.NotFoundException;
import com.buildfolio.backend.repository.RepositoryRepository;
import com.buildfolio.backend.services.github.GithubApiClient;

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


    @Transactional
    public List<RepositoryResponse> syncAndListRepos(UUID userId) {

        // 1. Find Buildfolio user
        User user = userService.requiredById(userId);

        // 2. Decrypt GitHub access token
        String token = userService.decryptAccessToken(user);

        // 3. Get repositories from GitHub
        List<Map<String, Object>> remoteRepos =
                gitHubApiClient.listUserRepos(token);

        List<Repository> saved = new ArrayList<>();

        // 4. Process every GitHub repository
        for (Map<String, Object> remote : remoteRepos) {

            Long githubRepoId = toLong(remote.get("id"));

            // 5. Check whether repository already exists
            Repository repo = repositoryRepository
                    .findByUserIdAndGithubRepoId(
                            userId,
                            githubRepoId
                    )
                    .orElseGet(Repository::new);

            // 6. Extract repository name
            String fullName =
                    String.valueOf(remote.get("full_name"));

            String[] parts = fullName.split("/", 2);

            String owner =
                    parts.length > 0
                            ? parts[0]
                            : null;

            String name =
                    parts.length > 1
                            ? parts[1]
                            : String.valueOf(remote.get("name"));

            // 7. If owner wasn't available from full_name,
            //    try GitHub's owner object
            if (owner == null || owner.isBlank()) {

                Object ownerObj = remote.get("owner");

                if (ownerObj instanceof Map<?, ?> ownerMap
                        && ownerMap.get("login") != null) {

                    owner =
                            String.valueOf(ownerMap.get("login"));
                }
            }

            // 8. Update repository information
            repo.setUserId(userId);

            repo.setGithubRepoId(githubRepoId);

            repo.setOwner(owner);

            repo.setName(name);

            repo.setFullName(fullName);

            repo.setPrivate(
                    Boolean.TRUE.equals(remote.get("private"))
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

            // 9. Save repository
            saved.add(
                    repositoryRepository.save(repo)
            );
        }

        // 10. Return sorted repositories
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
    public List<RepositoryResponse> listStored(UUID userId) {

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