package com.AuraGrid.AuraGrid.service;

import com.AuraGrid.AuraGrid.dto.PaymentRequest;
import com.AuraGrid.AuraGrid.dto.PaymentResponse;
import com.AuraGrid.AuraGrid.entity.Order;
import com.AuraGrid.AuraGrid.entity.OrderStatus;
import com.AuraGrid.AuraGrid.entity.Payment;
import com.AuraGrid.AuraGrid.entity.PaymentStatus;
import com.AuraGrid.AuraGrid.entity.User;
import com.AuraGrid.AuraGrid.repository.OrderRepository;
import com.AuraGrid.AuraGrid.repository.PaymentRepository;
import com.AuraGrid.AuraGrid.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            UserRepository userRepository) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PaymentResponse createPayment(
            String username,
            Long orderId,
            PaymentRequest request) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        // Make sure the order belongs to the authenticated user
        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "Order does not belong to this user"
            );
        }

        // Prevent multiple payments for the same order
        if (paymentRepository.findByOrder(order).isPresent()) {
            throw new IllegalArgumentException(
                    "Payment already exists for this order"
            );
        }

        Payment payment = new Payment();

        payment.setOrder(order);

        // Never trust the client for the payment amount.
        // Use the actual order total.
        payment.setAmount(order.getTotalAmount());

        payment.setPaymentMethod(request.getPaymentMethod());

        // Simulated successful payment
        payment.setPaymentStatus(PaymentStatus.SUCCESS);

        payment.setTransactionReference(
                generateTransactionReference()
        );

        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        // Payment succeeded, so confirm the order
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        return toResponse(savedPayment);
    }

    public PaymentResponse getPayment(
            String username,
            Long orderId) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        // Make sure the order belongs to the authenticated user
        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "Order does not belong to this user"
            );
        }

        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Payment not found for this order"
                        ));

        return toResponse(payment);
    }

    private void verifyAuthenticatedUser(String username) {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalArgumentException(
                    "User is not authenticated"
            );
        }

        String authenticatedUsername =
                authentication.getName();

        if (!authenticatedUsername.equals(username)) {

            throw new IllegalArgumentException(
                    "You cannot access another user's payments"
            );
        }
    }

    private User getUser(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }

    private String generateTransactionReference() {

        return "AG-" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 16)
                .toUpperCase();
    }

    private PaymentResponse toResponse(Payment payment) {

        return new PaymentResponse(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getPaymentStatus(),
                payment.getTransactionReference(),
                payment.getPaidAt(),
                payment.getCreatedAt()
        );
    }
}