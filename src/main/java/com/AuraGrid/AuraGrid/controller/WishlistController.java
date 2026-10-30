package com.AuraGrid.AuraGrid.controller;

import com.AuraGrid.AuraGrid.dto.WishlistRequest;
import com.AuraGrid.AuraGrid.dto.WishlistResponse;
import com.AuraGrid.AuraGrid.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @PostMapping("/{username}")
    public ResponseEntity<WishlistResponse> addToWishlist(
            @PathVariable String username,
            @Valid @RequestBody WishlistRequest request) {

        return ResponseEntity.ok(
                wishlistService.addToWishlist(
                        username,
                        request.getProductId()
                )
        );
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<WishlistResponse>> getWishlist(
            @PathVariable String username) {

        return ResponseEntity.ok(
                wishlistService.getWishlist(username)
        );
    }

    @DeleteMapping("/{username}/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable String username,
            @PathVariable Long productId) {

        wishlistService.removeFromWishlist(username, productId);

        return ResponseEntity.noContent().build();
    }
}