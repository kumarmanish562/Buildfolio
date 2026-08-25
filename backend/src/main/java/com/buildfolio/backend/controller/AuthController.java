package com.buildfolio.backend.controller;

import com.buildfolio.backend.dto.UserResponse;
import com.buildfolio.backend.entity.User;
import com.buildfolio.backend.security.AppUserPrincipal;
import com.buildfolio.backend.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CurrentUser currentUser;

    @GetMapping("/login-url")
    public Map<String, String> loginUrl() {

        return Map.of(
                "url",
                "/oauth2/authorization/github"
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {

        AppUserPrincipal principal = currentUser.require();

        User user = principal.getUser();

        return ResponseEntity.ok(
                new UserResponse(
                        user.getId(),
                        user.getGithubId(),
                        user.getGithubUsername(),
                        user.getDisplayName(),
                        user.getAvatarUrl()
                )
        );
    }
}