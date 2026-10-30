package com.AuraGrid.AuraGrid.repository;

import com.AuraGrid.AuraGrid.entity.Product;
import com.AuraGrid.AuraGrid.entity.Review;
import com.AuraGrid.AuraGrid.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProduct(Product product);

    Optional<Review> findByUserAndProduct(User user, Product product);
}