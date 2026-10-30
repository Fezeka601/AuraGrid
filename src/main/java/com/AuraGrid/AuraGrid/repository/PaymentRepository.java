package com.AuraGrid.AuraGrid.repository;

import com.AuraGrid.AuraGrid.entity.Order;
import com.AuraGrid.AuraGrid.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrder(Order order);

    Optional<Payment> findByTransactionReference(String transactionReference);
}