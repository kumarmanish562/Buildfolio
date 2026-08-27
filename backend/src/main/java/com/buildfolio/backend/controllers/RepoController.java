package com.buildfolio.backend.controllers;

import com.buildfolio.backend.dto.IndexStatusResponse;
import com.buildfolio.backend.dto.RepositoryResponse;
import com.buildfolio.backend.entity.Repository;
import com.buildfolio.backend.security.CurrentUser;
import com.buildfolio.backend.services.RepoService;
import com.buildfolio.backend.services.indexing.IndexingService;


import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/repos")
@RequiredArgsConstructor
public class RepoController {

    private final CurrentUser currentUser;
    private final RepoService repoService;
    private final IndexingService indexingService;


    /**
     * Get repositories of the current user.
     *
     * refresh=true  -> Fetch latest repositories from GitHub
     * refresh=false -> Return repositories already stored in DB
     */
    @GetMapping
    public List<RepositoryResponse> list(
            @RequestParam(
                    name = "refresh",
                    defaultValue = "true"
            )
            boolean refresh
    ) {

        UUID userId = currentUser.require().getId();

        if (refresh) {
            return repoService.syncAndListRepos(userId);
        }

        return repoService.listStored(userId);
    }


    /**
     * Get a single repository.
     */
    @GetMapping("/{id}")
    public RepositoryResponse get(
            @PathVariable UUID id
    ) {

        UUID userId = currentUser.require().getId();

        Repository repo =
                repoService.requireOwned(id, userId);

        return repoService.toResponse(repo);
    }


    /**
     * Start repository indexing.
     */
    @PostMapping("/{id}/index")
    public ResponseEntity<RepositoryResponse> index(
            @PathVariable UUID id
    ) {

        UUID userId = currentUser.require().getId();

        // Mark repository as INDEXING
        Repository repo =
                indexingService.startIndexing(id, userId);

        // Start indexing in background
        indexingService.indexAsync(id, userId);

        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(repoService.toResponse(repo));
    }


    /**
     * Get current indexing status.
     */
    @GetMapping("/{id}/status")
    public IndexStatusResponse status(
            @PathVariable UUID id
    ) {

        UUID userId = currentUser.require().getId();

        return repoService.status(id, userId);
    }
}