package com.AuraGrid.AuraGrid.service;

import com.AuraGrid.AuraGrid.dto.AdminDashboardResponse;
import com.AuraGrid.AuraGrid.dto.AdminOrderResponse;
import com.AuraGrid.AuraGrid.dto.UpdateOrderStatusRequest;
import com.AuraGrid.AuraGrid.entity.Order;
import com.AuraGrid.AuraGrid.entity.OrderStatus;
import com.AuraGrid.AuraGrid.entity.Payment;
import com.AuraGrid.AuraGrid.entity.PaymentStatus;
import com.AuraGrid.AuraGrid.repository.OrderRepository;
import com.AuraGrid.AuraGrid.repository.PaymentRepository;
import com.AuraGrid.AuraGrid.repository.ProductRepository;
import com.AuraGrid.AuraGrid.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AdminService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    public AdminService(
            ProductRepository productRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            PaymentRepository paymentRepository) {

        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {

        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();

        long totalCustomers =
                userRepository.countByRole("USER");

        BigDecimal totalRevenue = paymentRepository.findAll()
                .stream()
                .filter(payment ->
                        payment.getPaymentStatus() == PaymentStatus.SUCCESS)
                .map(Payment::getAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new AdminDashboardResponse(
                totalProducts,
                totalOrders,
                totalCustomers,
                totalRevenue
        );
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> getAllOrders() {

        return orderRepository.findAll()
                .stream()
                .map(this::toAdminOrderResponse)
                .toList();
    }

    @Transactional
    public AdminOrderResponse updateOrderStatus(
            Long orderId,
            UpdateOrderStatusRequest request) {

        if (request == null || request.getStatus() == null) {
            throw new IllegalArgumentException(
                    "Order status is required"
            );
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: " + orderId
                        )
                );

        OrderStatus newStatus = request.getStatus();

        if (newStatus == OrderStatus.CONFIRMED) {
            boolean hasSuccessfulPayment =
                    paymentRepository.findByOrder(order)
                            .filter(payment ->
                                    payment.getPaymentStatus()
                                            == PaymentStatus.SUCCESS)
                            .isPresent();

            if (!hasSuccessfulPayment) {
                throw new IllegalArgumentException(
                        "An order cannot be confirmed without a successful payment"
                );
            }
        }

        order.setStatus(newStatus);

        Order savedOrder = orderRepository.save(order);

        return toAdminOrderResponse(savedOrder);
    }

    private AdminOrderResponse toAdminOrderResponse(Order order) {

        return new AdminOrderResponse(
                order.getId(),
                order.getUser().getUsername(),
                order.getShippingAddress().getId(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt()
        );
    }
}