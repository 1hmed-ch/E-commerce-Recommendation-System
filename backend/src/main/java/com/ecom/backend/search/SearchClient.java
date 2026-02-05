package com.ecom.backend.search;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "search-service", url = "${recommendation.service.url}", fallback = SearchClientFallback.class)
public interface SearchClient {

    @GetMapping("/search/ids")
    SearchResponse searchProducts(
            @RequestParam("q") String query,
            @RequestParam(value = "top_k", required = false) Integer topK,
            @RequestParam(value = "min_price", required = false) Double minPrice,
            @RequestParam(value = "max_price", required = false) Double maxPrice,
            @RequestParam(value = "category", required = false) String category);
}
