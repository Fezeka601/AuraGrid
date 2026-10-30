package com.AuraGrid.AuraGrid.dto;

import jakarta.validation.constraints.NotNull;

public class WishlistRequest {

    @NotNull
    private Long productId;

    public WishlistRequest() {
    }

    public WishlistRequest(Long productId) {
        this.productId = productId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
}
