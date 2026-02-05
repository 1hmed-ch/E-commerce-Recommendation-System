package com.ecom.backend.search;

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
public class SearchService {
    private final SearchClient searchClient;
    private final ProductService productService;

    public List<ProductDTO> searchProducts(
            String query,
            Integer topK,
            Double minPrice,
            Double maxPrice,
            String category) {
        try {
            log.info("Searching products with query: '{}', topK: {}, minPrice: {}, maxPrice: {}, category: {}",
                    query, topK, minPrice, maxPrice, category);

            SearchResponse response = searchClient.searchProducts(query, topK, minPrice, maxPrice, category);

            if (response == null || response.getProductIds() == null || response.getProductIds().isEmpty()) {
                log.warn("No search results received from ML service for query: '{}'", query);
                return new ArrayList<>();
            }

            log.info("Received {} product IDs from ML search service", response.getProductIds().size());
            List<ProductDTO> products = productService.getProductsByIds(response.getProductIds());
            log.info("Successfully retrieved {} products from search", products.size());

            return products;
        } catch (Exception e) {
            log.error("Error searching products for query '{}': {}", query, e.getMessage());
            return new ArrayList<>();
        }
    }
}
