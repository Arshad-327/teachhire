package com.teachhire.auth;

import com.teachhire.auth.dto.AuthResponse;
import com.teachhire.auth.dto.LoginRequest;
import com.teachhire.auth.dto.SignupRequest;
import com.teachhire.common.ApiException;
import com.teachhire.config.JwtUtil;
import com.teachhire.profile.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final ProfileService profileService;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());

        User saved = userRepository.save(user);
        profileService.createProfileForUser(saved);

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getId(), saved.getRole().name());
        return new AuthResponse(token, saved.getId(), saved.getEmail(), saved.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getRole().name());
    }
}
