package com.ecom.backend.user;

import com.ecom.backend.common.ApiResponse;
import com.ecom.backend.config.JwtTokenProvider;
import com.ecom.backend.user.dto.AuthResponse;
import com.ecom.backend.user.dto.LoginRequest;
import com.ecom.backend.user.dto.RegisterRequest;
import com.ecom.backend.user.dto.UserDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication endpoints")
public class AuthController {
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    @Operation(summary = "Register new user")
    public ResponseEntity<ApiResponse<UserDTO>> register(@Valid @RequestBody RegisterRequest request){
        UserDTO user = userService.registerUser(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", user));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request){
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserDTO user = userService.getUserByUsername(request.getUsername());
        AuthResponse response = new AuthResponse(jwt, user);

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(Authentication authentication){
        UserDTO user = userService.getUserByUsername(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
