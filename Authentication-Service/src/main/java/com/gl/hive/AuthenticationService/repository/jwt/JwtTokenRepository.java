package com.gl.hive.AuthenticationService.repository.jwt;

import com.gl.hive.AuthenticationService.model.entity.jwt.JwtToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JwtTokenRepository extends JpaRepository<JwtToken, Long> {

    List<JwtToken> findAllByUser_UserIdAndExpiredIsFalseAndRevokedIsFalse(Long userId);

    List<JwtToken> findAllByUser_UserId(Long userId);

    Optional<JwtToken> findByToken(String token);

}