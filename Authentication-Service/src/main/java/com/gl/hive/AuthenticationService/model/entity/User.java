package com.gl.hive.AuthenticationService.model.entity;

import com.gl.hive.AuthenticationService.model.entity.jwt.JwtToken;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String username;
    
    @JsonIgnore
    private String password;
    
    private String email;



    private boolean active = false;

    /* relationships */
    /* users_roles */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "users_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Roles> roles = new HashSet<>();

    /* users_departments */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "users_departments",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "department_id")
    )
    @Builder.Default
    private Set<Departments> departments = new HashSet<>();

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<JwtToken> jwtTokens;
    /* end of relationships */

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        for (Roles eachRole : roles) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + eachRole.getRole().name()));
        }
        System.out.println("Authorities for user: " + this.getEmail() + " -> " + authorities);
        return authorities;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    // todo: implement the security to bypass even if the user is not active, but he/she won't have
    //  any access to any resources accept the login and search groups
    public boolean isEnabled() {
        return this.active;
    }

}
