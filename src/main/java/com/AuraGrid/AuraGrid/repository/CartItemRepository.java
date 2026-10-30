package com.AuraGrid.AuraGrid.repository;

import com.AuraGrid.AuraGrid.entity.Cart;
import com.AuraGrid.AuraGrid.entity.CartItem;
import com.AuraGrid.AuraGrid.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
}