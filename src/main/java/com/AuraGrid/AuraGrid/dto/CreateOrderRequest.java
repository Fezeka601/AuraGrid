package com.AuraGrid.AuraGrid.dto;

import jakarta.validation.constraints.NotNull;

public class CreateOrderRequest {

    @NotNull
    private Long shippingAddressId;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(Long shippingAddressId) {
        this.shippingAddressId = shippingAddressId;
    }

    public Long getShippingAddressId() {
        return shippingAddressId;
    }

    public void setShippingAddressId(Long shippingAddressId) {
        this.shippingAddressId = shippingAddressId;
    }
}