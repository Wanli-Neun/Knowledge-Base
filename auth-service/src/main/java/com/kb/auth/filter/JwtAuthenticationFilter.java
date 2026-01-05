package com.kb.auth.filter;

import java.io.IOException;

import java.util.List;
import java.util.UUID;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.kb.auth.service.JwtService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;


@Component
public class JwtAuthenticationFilter extends org.springframework.web.filter.OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (jwtService.validateToken(token)) {

            UUID userId = jwtService.extractUserId(token);
            String role = jwtService.extractRole(token);

            GrantedAuthority authority =
                    new SimpleGrantedAuthority("ROLE_" + role);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            List.of(authority)
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // You can set the authentication in the SecurityContext here if needed

        filterChain.doFilter(request, response);
    }
    
}
