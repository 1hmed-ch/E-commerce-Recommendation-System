package com.ecom.backend.order;

import com.ecom.backend.common.ApiResponse;
import com.ecom.backend.order.dto.CreateOrderRequest;
import com.ecom.backend.order.dto.OrderDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Orders", description = "Order management endpoints (requires authentication)")
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create new order", description = "Place a new order (requires authentication)")
    public ResponseEntity<ApiResponse<OrderDTO>> createOrder(@Valid @RequestBody CreateOrderRequest request, Authentication authentication) {
        OrderDTO orderDTO = orderService.createOrder(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Order created successfully", orderDTO));
    }

    @GetMapping
    @Operation(summary = "Get user orders", description = "Get all orders for current user")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getUserOrders(Authentication authentication) {
        List<OrderDTO> orders = orderService.getUserOrders(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Get specific order details")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderById(@PathVariable Long id, Authentication authentication) {
        OrderDTO order = orderService.getOrderById(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel order", description = "Cancel a pending or confirmed order")
    public ResponseEntity<ApiResponse<OrderDTO>> cancelOrder(@PathVariable Long id, Authentication authentication) {
        OrderDTO order = orderService.cancelOrder(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }
}
