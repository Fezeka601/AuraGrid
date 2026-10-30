package com.AuraGrid.AuraGrid.service;

import com.AuraGrid.AuraGrid.dto.WishlistResponse;
import com.AuraGrid.AuraGrid.entity.Product;
import com.AuraGrid.AuraGrid.entity.User;
import com.AuraGrid.AuraGrid.entity.Wishlist;
import com.AuraGrid.AuraGrid.repository.ProductRepository;
import com.AuraGrid.AuraGrid.repository.UserRepository;
import com.AuraGrid.AuraGrid.repository.WishlistRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistService(
            WishlistRepository wishlistRepository,
            UserRepository userRepository,
            ProductRepository productRepository) {

        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public WishlistResponse addToWishlist(
            String username,
            Long productId) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found"));

        if (wishlistRepository.findByUserAndProduct(user, product).isPresent()) {
            throw new IllegalArgumentException(
                    "Product is already in your wishlist"
            );
        }

        Wishlist wishlist = new Wishlist();

        wishlist.setUser(user);
        wishlist.setProduct(product);

        Wishlist savedWishlist = wishlistRepository.save(wishlist);

        return toResponse(savedWishlist);
    }

    public List<WishlistResponse> getWishlist(String username) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        return wishlistRepository.findByUser(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void removeFromWishlist(
            String username,
            Long productId) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found"));

        Wishlist wishlist = wishlistRepository
                .findByUserAndProduct(user, product)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Product is not in your wishlist"
                        ));

        wishlistRepository.delete(wishlist);
    }

    private void verifyAuthenticatedUser(String username) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalArgumentException(
                    "User is not authenticated"
            );
        }

        String authenticatedUsername = authentication.getName();

        if (!authenticatedUsername.equals(username)) {
            throw new IllegalArgumentException(
                    "You cannot access another user's wishlist"
            );
        }
    }

    private User getUser(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }

    private WishlistResponse toResponse(Wishlist wishlist) {

        Product product = wishlist.getProduct();

        return new WishlistResponse(
                wishlist.getId(),
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getImageUrl(),
                wishlist.getCreatedAt()
        );
    }
}