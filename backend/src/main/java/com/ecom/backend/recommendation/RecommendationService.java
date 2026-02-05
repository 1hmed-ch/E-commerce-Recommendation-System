package com.ecom.backend.recommendation;

import com.ecom.backend.product.Product;
import com.ecom.backend.product.ProductService;
import com.ecom.backend.product.dto.ProductDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {
    private final RecommendationClient recommendationClient;
    private final ProductService productService;

    public List<ProductDTO> getRecommendations(Long productId) {
        try {
            log.info("Fetching recommendations for product ID: {}", productId);

            productService.getProductById(productId);
            List<Long> recommendedIds = recommendationClient.getRecommendations(productId);
            if (recommendedIds == null || recommendedIds.isEmpty()) {
                log.warn("No recommendations received from ML service for product ID : {}", productId);
                return new ArrayList<>();
            }

            log.info("Received {} recommendations from ML service", recommendedIds.size());
            List<ProductDTO> recommendations = productService.getProductsByIds(recommendedIds);
            log.info("Successfully retrieved {} product recommendations", recommendations.size());
            return recommendations;
        } catch (Exception e) {
            log.error("Error fetching recommendations for product ID {}: {}", productId, e.getMessage());
            return new ArrayList<>();
        }
    }
}
