package org.example.cavista.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.cavista.JWT.AuthService;
import org.example.cavista.JWT.AuthenticationRequest;
import org.example.cavista.JWT.AuthenticationResponse;
import org.example.cavista.JWT.JWTService;
import org.example.cavista.JWT.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthenticationController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = "spring.cache.type=simple")
class AuthenticationControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    AuthService authService;

    /** Satisfy {@code JWTAuthenticationFilter} wiring in the sliced context. */
    @MockBean
    UserDetailsService userDetailsService;

    @MockBean
    JWTService jwtService;

    @Test
    void registerReturns201() throws Exception {
        when(authService.register(any(RegisterRequest.class)))
                .thenReturn(AuthenticationResponse.builder().token("jwt-here").build());

        RegisterRequest body = RegisterRequest.builder()
                .email("new@example.com")
                .password("password12")
                .name("New User")
                .phoneNumber("+2348012345678")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-here"));
    }

    @Test
    void loginReturns200() throws Exception {
        when(authService.authenticate(any(AuthenticationRequest.class)))
                .thenReturn(AuthenticationResponse.builder().token("jwt-login").build());

        AuthenticationRequest body = AuthenticationRequest.builder()
                .email("u@example.com")
                .password("secret1234")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-login"));
    }
}
