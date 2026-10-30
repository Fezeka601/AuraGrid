package com.AuraGrid.AuraGrid.service;

import com.AuraGrid.AuraGrid.dto.ReviewRequest;
import com.AuraGrid.AuraGrid.dto.ReviewResponse;
import com.AuraGrid.AuraGrid.entity.Product;
import com.AuraGrid.AuraGrid.entity.Review;
import com.AuraGrid.AuraGrid.entity.User;
import com.AuraGrid.AuraGrid.repository.ProductRepository;
import com.AuraGrid.AuraGrid.repository.ReviewRepository;
import com.AuraGrid.AuraGrid.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public ReviewResponse createReview(
            String username,
            Long productId,
            ReviewRequest request) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found"));

        if (reviewRepository.findByUserAndProduct(user, product).isPresent()) {
            throw new IllegalArgumentException(
                    "You have already reviewed this product"
            );
        }

        Review review = new Review();

        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review savedReview = reviewRepository.save(review);

        return toResponse(savedReview);
    }

    public List<ReviewResponse> getProductReviews(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found"));

        return reviewRepository.findByProduct(product)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ReviewResponse getReview(
            String username,
            Long reviewId) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "Review does not belong to this user"
            );
        }

        return toResponse(review);
    }

    public void deleteReview(
            String username,
            Long reviewId) {

        verifyAuthenticatedUser(username);

        User user = getUser(username);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "Review does not belong to this user"
            );
        }

        reviewRepository.delete(review);
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
                    "You cannot access another user's reviews"
            );
        }
    }

    private User getUser(String username) {

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }

    private ReviewResponse toResponse(Review review) {

        return new ReviewResponse(
                review.getId(),
                review.getProduct().getId(),
                review.getProduct().getName(),
                review.getUser().getUsername(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}