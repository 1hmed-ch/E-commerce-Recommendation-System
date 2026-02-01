package com.ecom.backend.recommendation;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(
    name = "recommendation-service",
    url = "${recommendation.service.url}",
    fallback = RecommendationClientFallback.class)
public interface RecommendationClient {

    @GetMapping("/api/recommendations/{productId}")
    List<Long> getRecommendations(@PathVariable("productId") Long productId);
}
