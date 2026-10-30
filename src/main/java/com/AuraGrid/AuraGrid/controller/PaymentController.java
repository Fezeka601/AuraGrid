package com.AuraGrid.AuraGrid.controller;

import com.AuraGrid.AuraGrid.dto.PaymentRequest;
import com.AuraGrid.AuraGrid.dto.PaymentResponse;
import com.AuraGrid.AuraGrid.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/{username}/{orderId}")
    public ResponseEntity<PaymentResponse> createPayment(
            @PathVariable String username,
            @PathVariable Long orderId,
            @Valid @RequestBody PaymentRequest request) {

        return ResponseEntity.ok(
                paymentService.createPayment(username, orderId, request)
        );
    }

    @GetMapping("/{username}/{orderId}")
    public ResponseEntity<PaymentResponse> getPayment(
            @PathVariable String username,
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                paymentService.getPayment(username, orderId)
        );
    }
}