package com.ecom.backend.recommendation;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class RecommendationClientFallback implements RecommendationClient{
    @Override
    public List<Long> getRecommendations(Long productId) {
        return new ArrayList<>();
    }
}
