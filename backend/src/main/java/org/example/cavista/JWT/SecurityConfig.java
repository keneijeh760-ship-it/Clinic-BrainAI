package org.example.cavista.JWT;

import lombok.RequiredArgsConstructor;
import org.example.cavista.security.ProblemDetailAccessDeniedHandler;
import org.example.cavista.security.ProblemDetailAuthEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JWTAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;
    private final ProblemDetailAuthEntryPoint authEntryPoint;
    private final ProblemDetailAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // ── Public ──────────────────────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register/patient").permitAll()
                        .requestMatchers("/api/v1/health").permitAll()
                        .requestMatchers("/actuator/health/**", "/actuator/info").permitAll()
                        // ── Authenticated (any valid JWT) ────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/auth/me").authenticated()
                        // ── Role-based ───────────────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/v1/visits/submit").hasRole("CHEW")
                        .requestMatchers(HttpMethod.GET, "/api/v1/visits/mine").hasRole("CHEW")
                        .requestMatchers(HttpMethod.GET, "/api/v1/visits/pending-review").hasAnyRole("CHEW", "DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/visits/**").hasAnyRole("CHEW", "DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/patients/register").hasRole("CHEW")
                        .requestMatchers(HttpMethod.GET, "/api/v1/patients/mine").hasRole("CHEW")
                        .requestMatchers(HttpMethod.GET, "/api/v1/patients/search").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/patients/qr/**").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/outcomes").hasRole("DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/outcomes/mine").hasRole("DOCTOR")
                        .requestMatchers("/api/v1/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/stats/**").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers("/api/v1/me/**").hasRole("PATIENT")
                        .requestMatchers(HttpMethod.GET, "/api/v1/leaderboard/**").authenticated()
                        // ── Catch-all ────────────────────────────────────────────────────
                        .anyRequest().authenticated()
                )
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "http://localhost:5176",
                "http://localhost:3000"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
