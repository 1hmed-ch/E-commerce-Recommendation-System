package com.ecom.backend.order.dto;

import com.ecom.backend.order.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrderDTO {
    private Long id;
    private Long userId;
    private String username;
    private List<OrderItemDTO> items;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private String paymentMethod;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
