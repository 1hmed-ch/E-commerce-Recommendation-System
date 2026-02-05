package com.ecom.backend.utile;

import com.ecom.backend.order.Order;
import com.ecom.backend.order.OrderItem;
import com.ecom.backend.order.dto.OrderDTO;
import com.ecom.backend.order.dto.OrderItemDTO;
import com.ecom.backend.product.Product;
import com.ecom.backend.product.dto.ProductDTO;
import com.ecom.backend.user.User;
import com.ecom.backend.user.dto.UserDTO;

import java.util.stream.Collectors;

public class MapperUtil {
    public static UserDTO toUserDTO(User user) {
        if (user == null) return null;

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        return dto;
    }

    public static ProductDTO toProductDTO(Product product) {
        if (product == null) return null;

        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setImageUrl(product.getImageUrl());
        dto.setCategory(product.getCategory());
        dto.setBrand(product.getBrand());
        dto.setAvailable(product.getAvailable());
        return dto;
    }

    public static OrderDTO toOrderDTO(Order order) {
        if (order == null) return null;

        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setUsername(order.getUser().getUsername());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getOrderStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        dto.setItems(order.getItems().stream().map(MapperUtil::toOrderItemDTO).collect(Collectors.toList()));
        return dto;
    }

    private static OrderItemDTO toOrderItemDTO(OrderItem orderItem) {
        if (orderItem == null) return null;

        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(orderItem.getId());
        if (orderItem.getOrder() != null) {
            dto.setOrderId(orderItem.getOrder().getId());
        }

        dto.setProductId(orderItem.getProduct().getId());
        dto.setProductName(orderItem.getProduct().getName());
        dto.setQuantity(orderItem.getQuantity());
        dto.setPrice(orderItem.getPrice());
        dto.setSubtotal(orderItem.getSubtotal());

        return dto;
    }
}
