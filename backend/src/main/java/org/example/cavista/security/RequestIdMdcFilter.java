package org.example.cavista.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Propagates a request id for log correlation (MDC) and echoes it in the response header.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class RequestIdMdcFilter extends OncePerRequestFilter {

    public static final String HEADER_NAME = "X-Request-Id";
    public static final String MDC_KEY = "requestId";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String rid = request.getHeader(HEADER_NAME);
        if (rid == null || rid.isBlank()) {
            rid = UUID.randomUUID().toString();
        }
        MDC.put(MDC_KEY, rid);
        response.setHeader(HEADER_NAME, rid);
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }
}
