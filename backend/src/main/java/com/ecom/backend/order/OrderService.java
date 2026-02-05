package com.ecom.backend.order;

import com.ecom.backend.order.dto.CreateOrderRequest;
import com.ecom.backend.order.dto.OrderDTO;
import com.ecom.backend.order.dto.OrderItemRequest;
import com.ecom.backend.product.Product;
import com.ecom.backend.product.ProductService;
import com.ecom.backend.user.User;
import com.ecom.backend.user.UserService;
import com.ecom.backend.utile.MapperUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final UserService userService;

    @Transactional
    public OrderDTO createOrder(String username, CreateOrderRequest request) {
        User user = userService.findByUsername(username);

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod());

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItemRequest itemRequest : request.getItems()){
            Product product = productService.findById(itemRequest.getProductId());
            if(product.getStockQuantity() < itemRequest.getQuantity()){
                throw new IllegalArgumentException(
                        "Insufficient stock for product : " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(product.getPrice());
            BigDecimal itemSubtotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            orderItem.setSubtotal(itemSubtotal);
            order.addItem(orderItem);
            totalAmount = totalAmount.add(itemSubtotal);

            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
        }

        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);

        return MapperUtil.toOrderDTO(order);
    }

    public List<OrderDTO> getUserOrders(String username){
        return orderRepository.findByUserUsername(username).stream()
                .map(MapperUtil::toOrderDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrderById(Long id, String username){
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id : " + id));
        if(!order.getUser().getUsername().equals(username)){
            throw new SecurityException("Access denied to order id : " + id);
        }
        return MapperUtil.toOrderDTO(order);
    }

    @Transactional
    public OrderDTO cancelOrder(Long id, String username){
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id : " + id));
        if(!order.getUser().getUsername().equals(username)){
            throw new SecurityException("Access denied : you don't have permission to cancel this order : " + id);
        }
        if(order.getOrderStatus() == OrderStatus.PENDING || order.getOrderStatus() == OrderStatus.CONFIRMED){
            order.setOrderStatus(OrderStatus.CANCELLED);
            for(OrderItem item : order.getItems()){
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            }
            order = orderRepository.save(order);
        } else {
            throw new IllegalStateException("Only pending or confirmed orders can be cancelled");
        }
        return MapperUtil.toOrderDTO(order);
    }



}
