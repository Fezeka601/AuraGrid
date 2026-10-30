package com.AuraGrid.AuraGrid.repository;

import com.AuraGrid.AuraGrid.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}