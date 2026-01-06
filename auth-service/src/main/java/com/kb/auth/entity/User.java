package com.kb.auth.entity;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import jakarta.persistence.Column;

import com.kb.auth.enums.Role;

import java.time.Instant;

@Entity
@Table( name = "users" )
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column()
    private String fullName;

    @Column()
    private String displayName;

    @Column()
    private String avaUrl;

    @Column(nullable = false, length = 512)
    private String password;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @PrePersist
    protected void onCreate(){
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate(){
        this.updatedAt = Instant.now();
    }
        
    public void updateProfile(String fullName, String displayName, String avaUrl) {
        if (fullName != null) {
            this.fullName = fullName;
        }
        if (displayName != null) {
            this.displayName = displayName;
        }
        if (avaUrl != null) {
            this.avaUrl = avaUrl;
        }
    }

    public void changePassword(String newPassword) {
        this.password = newPassword;
    }
}
