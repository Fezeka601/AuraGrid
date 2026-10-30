package com.AuraGrid.AuraGrid.controller;

import com.AuraGrid.AuraGrid.dto.ReviewRequest;
import com.AuraGrid.AuraGrid.dto.ReviewResponse;
import com.AuraGrid.AuraGrid.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/{username}/{productId}")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable String username,
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request) {

        return ResponseEntity.ok(
                reviewService.createReview(username, productId, request)
        );
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                reviewService.getProductReviews(productId)
        );
    }

    @GetMapping("/{username}/{reviewId}")
    public ResponseEntity<ReviewResponse> getReview(
            @PathVariable String username,
            @PathVariable Long reviewId) {

        return ResponseEntity.ok(
                reviewService.getReview(username, reviewId)
        );
    }

    @DeleteMapping("/{username}/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable String username,
            @PathVariable Long reviewId) {

        reviewService.deleteReview(username, reviewId);

        return ResponseEntity.noContent().build();
    }
}