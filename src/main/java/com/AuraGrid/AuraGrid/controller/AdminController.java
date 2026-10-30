package com.AuraGrid.AuraGrid.controller;

import com.AuraGrid.AuraGrid.dto.AdminDashboardResponse;
import com.AuraGrid.AuraGrid.dto.AdminOrderResponse;
import com.AuraGrid.AuraGrid.dto.UpdateOrderStatusRequest;
import com.AuraGrid.AuraGrid.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(
                adminService.getDashboard()
        );
    }

    @GetMapping("/orders")
    public ResponseEntity<List<AdminOrderResponse>> getAllOrders() {
        return ResponseEntity.ok(
                adminService.getAllOrders()
        );
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<AdminOrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        return ResponseEntity.ok(
                adminService.updateOrderStatus(orderId, request)
        );
    }
}