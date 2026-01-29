package com.ecom.backend.user.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String address;
}
