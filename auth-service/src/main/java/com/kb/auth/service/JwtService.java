package com.kb.auth.service;

import com.kb.auth.entity.User;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.nio.charset.StandardCharsets;

import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.time.Instant;
import java.util.UUID;

import java.util.Date;

import javax.crypto.SecretKey;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long accessTokenExpirationMs;
    
    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration-ms}") long accessTokenExpirationMs
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationMs = accessTokenExpirationMs;
    }

    public String generateAccessToken(User user) {

        Instant now = Instant.now();

        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusMillis(accessTokenExpirationMs)))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
        } catch (Exception ex) {
            return false;
        }
        return true;
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public String extractEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
