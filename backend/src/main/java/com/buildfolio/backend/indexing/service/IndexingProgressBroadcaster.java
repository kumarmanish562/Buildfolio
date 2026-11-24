package com.buildfolio.backend.indexing.service;

import com.buildfolio.backend.repo.dto.IndexStatusResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class IndexingProgressBroadcaster {

    private final Map<UUID, CopyOnWriteArrayList<SseEmitter>> emittersByRepo = new ConcurrentHashMap<>();

    public SseEmitter register(UUID repoId) {
        SseEmitter emitter = new SseEmitter(180_000L);
        emittersByRepo.computeIfAbsent(repoId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> remove(repoId, emitter));
        emitter.onTimeout(() -> remove(repoId, emitter));
        emitter.onError(e -> remove(repoId, emitter));

        return emitter;
    }

    public void broadcast(UUID repoId, IndexStatusResponse status) {
        CopyOnWriteArrayList<SseEmitter> emitters = emittersByRepo.get(repoId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("progress")
                        .data(status));
            } catch (IOException e) {
                remove(repoId, emitter);
            }
        }
    }

    private void remove(UUID repoId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> list = emittersByRepo.get(repoId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                emittersByRepo.remove(repoId);
            }
        }
    }
}
