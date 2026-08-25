package com.buildfolio.backend.config;

import com.buildfolio.backend.security.GithubOAuth2UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final GithubOAuth2UserService githubOAuth2UserService;

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthenticationSuccessHandler oauth2SuccessHandler,
            AuthenticationFailureHandler oauth2FailureHandler
    ) throws Exception {

        http
                // CORS
                .cors(Customizer.withDefaults())

                // Disable CSRF for API usage
                .csrf(csrf -> csrf.disable())

                // OAuth2 uses a session during authentication
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.IF_REQUIRED
                        )
                )

                // Authorization rules
                .authorizeHttpRequests(auth -> auth

                        // Public authentication endpoints
                        .requestMatchers(
                                "/api/auth/login-url",
                                "/oauth2/**",
                                "/login/oauth2/**",
                                "/error"
                        ).permitAll()

                        // CORS preflight
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // API endpoints require authentication
                        .requestMatchers("/api/**")
                        .authenticated()

                        // Everything else is public
                        .anyRequest()
                        .permitAll()
                )

                // Return 401 instead of redirecting API requests
                .exceptionHandling(ex ->
                        ex.authenticationEntryPoint(
                                new HttpStatusEntryPoint(
                                        HttpStatus.UNAUTHORIZED
                                )
                        )
                )

                // GitHub OAuth2
                .oauth2Login(oauth -> oauth

                        .userInfoEndpoint(userInfo ->
                                userInfo.userService(
                                        githubOAuth2UserService
                                )
                        )

                        .successHandler(oauth2SuccessHandler)

                        .failureHandler(oauth2FailureHandler)
                )

                // Logout
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")

                        .logoutSuccessHandler(
                                (request, response, authentication) ->
                                        response.setStatus(
                                                HttpStatus.NO_CONTENT.value()
                                        )
                        )

                        .invalidateHttpSession(true)

                        .clearAuthentication(true)

                        .deleteCookies("BUILDFOLIO_SESSION")
                );

        return http.build();
    }


    /**
     * Called after successful GitHub OAuth login.
     */
    @Bean
    AuthenticationSuccessHandler oauth2SuccessHandler(
            @Value("${app.frontend-url}") String frontendUrl
    ) {

        SimpleUrlAuthenticationSuccessHandler handler =
                new SimpleUrlAuthenticationSuccessHandler();

        handler.setDefaultTargetUrl(
                frontendUrl + "/auth/callback"
        );

        return handler;
    }


    /**
     * Called when GitHub OAuth login fails.
     */
    @Bean
    AuthenticationFailureHandler oauth2FailureHandler(
            @Value("${app.frontend-url}") String frontendUrl
    ) {

        SimpleUrlAuthenticationFailureHandler handler =
                new SimpleUrlAuthenticationFailureHandler();

        handler.setDefaultFailureUrl(
                frontendUrl + "/login?error=oauth_failed"
        );

        return handler;
    }
}