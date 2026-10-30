package com.AuraGrid.AuraGrid.repository;

import com.AuraGrid.AuraGrid.entity.Order;
import com.AuraGrid.AuraGrid.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser(User user);
}