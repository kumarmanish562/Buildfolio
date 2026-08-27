package com.buildfolio.backend.controllers;

import com.buildfolio.backend.dto.IndexStatusResponse;
import com.buildfolio.backend.dto.RepositoryResponse;

import com.buildfolio.backend.security.CurrentUser;
import com.buildfolio.backend.services.RepoService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/repos")
@RequiredArgsConstructor
public class RepoController {


    private final CurrentUser currentUser;
    private final RepoService repoService;


   @GetMapping
   public List<RepositoryResponse> list(
           @RequestParam(name = "refresh", defaultValue = "true") boolean refresh) {
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

    @GetMapping("/{id}/status")
    public IndexStatusResponse status(@PathVariable UUID id) {
        UUID userId = currentUser.require().getId();
        return repoService.status(id, userId);
    }

}
