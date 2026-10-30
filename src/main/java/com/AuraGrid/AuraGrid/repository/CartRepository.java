package com.AuraGrid.AuraGrid.repository;

import com.AuraGrid.AuraGrid.entity.Cart;
import com.AuraGrid.AuraGrid.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);
}