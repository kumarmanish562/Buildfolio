
package com.buildfolio.backend.services;


import com.buildfolio.backend.entity.Repository;
import com.buildfolio.backend.repository.RepositoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class

RepositoryService {

    private final RepositoryRepository repositoryRepository;

    public void deleteRepository(UUID repositoryId) {

        Repository repository =
                repositoryRepository
                        .findById(repositoryId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Repository not found"
                                )
                        );

        repositoryRepository.delete(repository);
    }
}