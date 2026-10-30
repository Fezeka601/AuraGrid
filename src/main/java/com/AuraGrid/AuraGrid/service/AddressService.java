package com.AuraGrid.AuraGrid.service;

import com.AuraGrid.AuraGrid.dto.AddressRequest;
import com.AuraGrid.AuraGrid.dto.AddressResponse;
import com.AuraGrid.AuraGrid.entity.Address;
import com.AuraGrid.AuraGrid.entity.User;
import com.AuraGrid.AuraGrid.repository.AddressRepository;
import com.AuraGrid.AuraGrid.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(
            AddressRepository addressRepository,
            UserRepository userRepository) {

        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    public AddressResponse createAddress(
            String username,
            AddressRequest request) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Address address = new Address();

        address.setUser(user);
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setProvince(request.getProvince());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());

        Address savedAddress = addressRepository.save(address);

        return toResponse(savedAddress);
    }

    public List<AddressResponse> getUserAddresses(
            String username) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        return addressRepository.findByUser(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AddressResponse getAddressById(
            String username,
            Long addressId) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Address not found"));

        verifyOwnership(address, user);

        return toResponse(address);
    }

    public AddressResponse updateAddress(
            String username,
            Long addressId,
            AddressRequest request) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Address not found"));

        verifyOwnership(address, user);

        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setProvince(request.getProvince());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());

        Address updatedAddress =
                addressRepository.save(address);

        return toResponse(updatedAddress);
    }

    public void deleteAddress(
            String username,
            Long addressId) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Address not found"));

        verifyOwnership(address, user);

        addressRepository.delete(address);
    }

    private void verifyAuthenticatedUser(String username) {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalArgumentException(
                    "User is not authenticated"
            );
        }

        String authenticatedUsername =
                authentication.getName();

        if (!authenticatedUsername.equals(username)) {

            throw new IllegalArgumentException(
                    "You cannot access another user's addresses"
            );
        }
    }

    private User getUser(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"));
    }

    private void verifyOwnership(
            Address address,
            User user) {

        if (!address.getUser().getId().equals(user.getId())) {

            throw new IllegalArgumentException(
                    "Address does not belong to this user");
        }
    }

    private AddressResponse toResponse(Address address) {

        return new AddressResponse(
                address.getId(),
                address.getAddressLine1(),
                address.getAddressLine2(),
                address.getCity(),
                address.getProvince(),
                address.getPostalCode(),
                address.getCountry()
        );
    }
}