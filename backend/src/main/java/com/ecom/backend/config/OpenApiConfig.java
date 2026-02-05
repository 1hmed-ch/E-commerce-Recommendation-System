package com.ecom.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "E-Commerce",
                version = "1.0.0",
                description = "REST API for e-commerce application with product recommendation, authentication, and order management",
                contact = @Contact(
                        name = "Group 5 : Ahmed - Yassine - Assia - Aya ",
                        email = "ahmed.chakhmmani@usmba.ac.ma"
                )
        ),
        servers = {
                @Server(url = "http://localhost:8080/api", description = "Local Development Server")
        }
)
@SecurityScheme(
        name = "bearerAuth",
        description = "JWT authentication token",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {

}
