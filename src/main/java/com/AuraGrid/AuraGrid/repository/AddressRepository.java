package com.AuraGrid.AuraGrid.repository;

import com.AuraGrid.AuraGrid.entity.Address;
import com.AuraGrid.AuraGrid.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUser(User user);
}