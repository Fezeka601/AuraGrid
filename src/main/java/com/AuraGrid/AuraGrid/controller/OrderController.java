package com.AuraGrid.AuraGrid.controller;

import com.AuraGrid.AuraGrid.dto.CreateOrderRequest;
import com.AuraGrid.AuraGrid.dto.OrderResponse;
import com.AuraGrid.AuraGrid.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/{username}")
    public ResponseEntity<OrderResponse> createOrder(
            @PathVariable String username,
            @Valid @RequestBody CreateOrderRequest request) {

        return ResponseEntity.ok(
                orderService.createOrder(username, request)
        );
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<OrderResponse>> getUserOrders(
            @PathVariable String username) {

        return ResponseEntity.ok(
                orderService.getUserOrders(username)
        );
    }

    @GetMapping("/{username}/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable String username,
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderService.getOrderById(username, orderId)
        );
    }
}