package com.AuraGrid.AuraGrid.service;

import com.AuraGrid.AuraGrid.dto.CreateOrderRequest;
import com.AuraGrid.AuraGrid.dto.OrderItemResponse;
import com.AuraGrid.AuraGrid.dto.OrderResponse;
import com.AuraGrid.AuraGrid.entity.Address;
import com.AuraGrid.AuraGrid.entity.Cart;
import com.AuraGrid.AuraGrid.entity.CartItem;
import com.AuraGrid.AuraGrid.entity.Order;
import com.AuraGrid.AuraGrid.entity.OrderItem;
import com.AuraGrid.AuraGrid.entity.OrderStatus;
import com.AuraGrid.AuraGrid.entity.Product;
import com.AuraGrid.AuraGrid.entity.User;
import com.AuraGrid.AuraGrid.repository.AddressRepository;
import com.AuraGrid.AuraGrid.repository.CartItemRepository;
import com.AuraGrid.AuraGrid.repository.CartRepository;
import com.AuraGrid.AuraGrid.repository.OrderItemRepository;
import com.AuraGrid.AuraGrid.repository.OrderRepository;
import com.AuraGrid.AuraGrid.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            AddressRepository addressRepository,
            UserRepository userRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse createOrder(
            String username,
            CreateOrderRequest request) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart not found"));

        List<CartItem> cartItems =
                cartItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        Address address = addressRepository.findById(
                request.getShippingAddressId()
        ).orElseThrow(() ->
                new IllegalArgumentException("Shipping address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "Shipping address does not belong to this user");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {

            Product product = cartItem.getProduct();

            if (cartItem.getQuantity() > product.getStockQuantity()) {
                throw new IllegalArgumentException(
                        "Not enough stock for product: "
                                + product.getName());
            }

            BigDecimal subtotal = product.getPrice()
                    .multiply(
                            BigDecimal.valueOf(cartItem.getQuantity())
                    );

            totalAmount = totalAmount.add(subtotal);
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(address);
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PENDING);

        Order savedOrder = orderRepository.save(order);

        for (CartItem cartItem : cartItems) {

            Product product = cartItem.getProduct();

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(product.getPrice());

            orderItemRepository.save(orderItem);

            product.setStockQuantity(
                    product.getStockQuantity()
                            - cartItem.getQuantity()
            );
        }

        cartItemRepository.deleteAll(cartItems);

        return toOrderResponse(savedOrder);
    }

    public List<OrderResponse> getUserOrders(String username) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        return orderRepository.findByUser(user)
                .stream()
                .map(this::toOrderResponse)
                .toList();
    }

    public OrderResponse getOrderById(
            String username,
            Long orderId) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "Order does not belong to this user");
        }

        return toOrderResponse(order);
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
                    "You cannot access another user's orders"
            );
        }
    }

    private User getUser(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }

    private OrderResponse toOrderResponse(Order order) {

        List<OrderItem> orderItems =
                orderItemRepository.findByOrder(order);

        List<OrderItemResponse> itemResponses =
                orderItems.stream()
                        .map(this::toOrderItemResponse)
                        .toList();

        return new OrderResponse(
                order.getId(),
                order.getShippingAddress().getId(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                itemResponses
        );
    }

    private OrderItemResponse toOrderItemResponse(
            OrderItem orderItem) {

        Product product = orderItem.getProduct();

        BigDecimal subtotal = orderItem.getUnitPrice()
                .multiply(
                        BigDecimal.valueOf(orderItem.getQuantity())
                );

        return new OrderItemResponse(
                product.getId(),
                product.getName(),
                orderItem.getQuantity(),
                orderItem.getUnitPrice(),
                subtotal
        );
    }
}