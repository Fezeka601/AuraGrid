package com.AuraGrid.AuraGrid.service;

import com.AuraGrid.AuraGrid.dto.CartItemResponse;
import com.AuraGrid.AuraGrid.dto.CartResponse;
import com.AuraGrid.AuraGrid.entity.Cart;
import com.AuraGrid.AuraGrid.entity.CartItem;
import com.AuraGrid.AuraGrid.entity.Product;
import com.AuraGrid.AuraGrid.entity.User;
import com.AuraGrid.AuraGrid.repository.CartItemRepository;
import com.AuraGrid.AuraGrid.repository.CartRepository;
import com.AuraGrid.AuraGrid.repository.ProductRepository;
import com.AuraGrid.AuraGrid.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public CartResponse getCart(String username) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> createCart(user));

        return buildCartResponse(cart);
    }

    public CartResponse addToCart(
            String username,
            Long productId,
            Integer quantity) {

        verifyAuthenticatedUser(username);

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero"
            );
        }

        User user = getUser(username);

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> createCart(user));

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found"));

        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException(
                    "Not enough stock available"
            );
        }

        CartItem cartItem = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElse(null);

        if (cartItem == null) {

            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);

        } else {

            int newQuantity =
                    cartItem.getQuantity() + quantity;

            if (newQuantity > product.getStockQuantity()) {
                throw new IllegalArgumentException(
                        "Requested quantity exceeds available stock"
                );
            }

            cartItem.setQuantity(newQuantity);
        }

        cartItemRepository.save(cartItem);

        return buildCartResponse(cart);
    }

    public CartResponse updateQuantity(
            String username,
            Long productId,
            Integer quantity) {

        verifyAuthenticatedUser(username);

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero"
            );
        }

        User user = getUser(username);

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found"));

        if (quantity > product.getStockQuantity()) {
            throw new IllegalArgumentException(
                    "Not enough stock available"
            );
        }

        CartItem cartItem = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Product is not in cart"
                        ));

        cartItem.setQuantity(quantity);

        cartItemRepository.save(cartItem);

        return buildCartResponse(cart);
    }

    public CartResponse removeFromCart(
            String username,
            Long productId) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found"));

        CartItem cartItem = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Product is not in cart"
                        ));

        cartItemRepository.delete(cartItem);

        return buildCartResponse(cart);
    }

    public void clearCart(String username) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart not found"));

        List<CartItem> items =
                cartItemRepository.findByCart(cart);

        cartItemRepository.deleteAll(items);
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
                    "You cannot access another user's cart"
            );
        }
    }

    private User getUser(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }

    private Cart createCart(User user) {

        Cart cart = new Cart();
        cart.setUser(user);

        return cartRepository.save(cart);
    }

    private CartResponse buildCartResponse(Cart cart) {

        List<CartItem> cartItems =
                cartItemRepository.findByCart(cart);

        List<CartItemResponse> itemResponses =
                cartItems.stream()
                        .map(this::toCartItemResponse)
                        .toList();

        BigDecimal totalAmount =
                itemResponses.stream()
                        .map(CartItemResponse::getSubtotal)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(
                cart.getId(),
                itemResponses,
                totalAmount
        );
    }

    private CartItemResponse toCartItemResponse(CartItem item) {

        Product product = item.getProduct();

        BigDecimal subtotal =
                product.getPrice()
                        .multiply(
                                BigDecimal.valueOf(item.getQuantity())
                        );

        return new CartItemResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getImageUrl(),
                item.getQuantity(),
                subtotal
        );
    }
}