package com.AuraGrid.AuraGrid.controller;

import com.AuraGrid.AuraGrid.dto.CartResponse;
import com.AuraGrid.AuraGrid.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{username}")
    public ResponseEntity<CartResponse> getCart(
            @PathVariable String username) {

        return ResponseEntity.ok(
                cartService.getCart(username)
        );
    }

    @PostMapping("/{username}/add")
    public ResponseEntity<CartResponse> addToCart(
            @PathVariable String username,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {

        return ResponseEntity.ok(
                cartService.addToCart(
                        username,
                        productId,
                        quantity
                )
        );
    }

    @PutMapping("/{username}/update")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable String username,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {

        return ResponseEntity.ok(
                cartService.updateQuantity(
                        username,
                        productId,
                        quantity
                )
        );
    }

    @DeleteMapping("/{username}/remove")
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable String username,
            @RequestParam Long productId) {

        return ResponseEntity.ok(
                cartService.removeFromCart(
                        username,
                        productId
                )
        );
    }

    @DeleteMapping("/{username}/clear")
    public ResponseEntity<Void> clearCart(
            @PathVariable String username) {

        cartService.clearCart(username);

        return ResponseEntity.noContent().build();
    }
}