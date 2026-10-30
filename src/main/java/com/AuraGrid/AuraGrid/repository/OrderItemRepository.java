package com.AuraGrid.AuraGrid.repository;

import com.AuraGrid.AuraGrid.entity.Order;
import com.AuraGrid.AuraGrid.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);
}