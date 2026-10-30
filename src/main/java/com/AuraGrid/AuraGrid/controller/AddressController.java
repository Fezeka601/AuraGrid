package com.AuraGrid.AuraGrid.controller;

import com.AuraGrid.AuraGrid.dto.AddressRequest;
import com.AuraGrid.AuraGrid.dto.AddressResponse;
import com.AuraGrid.AuraGrid.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @PostMapping("/{username}")
    public ResponseEntity<AddressResponse> createAddress(
            @PathVariable String username,
            @Valid @RequestBody AddressRequest request) {

        return ResponseEntity.ok(
                addressService.createAddress(username, request)
        );
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<AddressResponse>> getUserAddresses(
            @PathVariable String username) {

        return ResponseEntity.ok(
                addressService.getUserAddresses(username)
        );
    }

    @GetMapping("/{username}/{addressId}")
    public ResponseEntity<AddressResponse> getAddressById(
            @PathVariable String username,
            @PathVariable Long addressId) {

        return ResponseEntity.ok(
                addressService.getAddressById(
                        username,
                        addressId
                )
        );
    }

    @PutMapping("/{username}/{addressId}")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable String username,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest request) {

        return ResponseEntity.ok(
                addressService.updateAddress(
                        username,
                        addressId,
                        request
                )
        );
    }

    @DeleteMapping("/{username}/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable String username,
            @PathVariable Long addressId) {

        addressService.deleteAddress(
                username,
                addressId
        );

        return ResponseEntity.noContent().build();
    }
}