package com.ecom.backend.search;

import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class SearchClientFallback implements SearchClient {

    @Override
    public SearchResponse searchProducts(String query, Integer topK, Double minPrice, Double maxPrice,
            String category) {
        // Return empty results when FastAPI service is unavailable
        return new SearchResponse(new ArrayList<>(), 0, query);
    }
}
