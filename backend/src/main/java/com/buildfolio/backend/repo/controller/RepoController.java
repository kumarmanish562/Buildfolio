package com.buildfolio.backend.repo.controller;

import com.buildfolio.backend.common.security.CurrentUser;
import com.buildfolio.backend.indexing.service.IndexingProgressBroadcaster;
import com.buildfolio.backend.indexing.service.IndexingService;
import com.buildfolio.backend.repo.dto.IndexStatusResponse;
import com.buildfolio.backend.repo.dto.RepositoryResponse;
import com.buildfolio.backend.repo.entity.Repository;
import com.buildfolio.backend.repo.service.RepoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/repos")
@RequiredArgsConstructor
public class RepoController {

    private final CurrentUser currentUser;
    private final RepoService repoService;
    private final IndexingService indexingService;
    private final IndexingProgressBroadcaster progressBroadcaster;

    @GetMapping
    public List<RepositoryResponse> list(
            @RequestParam(name = "refresh", defaultValue = "true") boolean refresh
    ) {
        UUID userId = currentUser.require().getId();
        if (refresh) {
            return repoService.syncAndListRepos(userId);
        }
        return repoService.listStored(userId);
    }

    @GetMapping("/{id}")
    public RepositoryResponse get(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        return repoService.toResponse(repoService.requireOwned(id, userId));
    }

    @PostMapping("/{id}/index")
    public ResponseEntity<RepositoryResponse> index(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        Repository repo = indexingService.startIndexing(id, userId);
        indexingService.indexAsync(id, userId);

        return ResponseEntity
                .status(HttpStatus.ACCEPTED)
                .body(repoService.toResponse(repo));
    }

    @GetMapping("/{id}/index-status")
    public IndexStatusResponse getStatus(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        Repository repo = repoService.requireOwned(id, userId);
        return new IndexStatusResponse(
                repo.getId(),
                repo.getIndexStatus(),
                repo.getFilesTotal(),
                repo.getFilesProcessed(),
                repo.getChunkCount(),
                repo.getIndexedAt(),
                repo.getErrorMessage());
    }

    @GetMapping(value = "/{id}/index-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamIndexProgress(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        repoService.requireOwned(id, userId);
        return progressBroadcaster.register(id);
    }
}
