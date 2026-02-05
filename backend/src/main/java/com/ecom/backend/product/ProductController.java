package com.ecom.backend.product;

import com.ecom.backend.common.ApiResponse;
import com.ecom.backend.common.PaginatedResponse;
import com.ecom.backend.product.dto.ProductDTO;
import com.ecom.backend.recommendation.RecommendationService;
import com.ecom.backend.search.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final RecommendationService recommendationService;
    private final SearchService searchService;

    @GetMapping
    @Operation(summary = "Get all products", description = "Retrieve all available products with optional pagination")
    public ResponseEntity<ApiResponse<Object>> getAllProducts(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        // If size is very large (e.g., > 100), consider it "all" or limit it
        // For backward compatibility, we'll implement a switch based on request params?
        // Actually, best practice is to always paginate effectively.
        // But to keep existing frontend working without changes immediately:
        // We can just return paginated response. But wait, existing frontend expects
        // List<ProductDTO> in `data`.
        // If we change structure of `data` to be an object with metadata, it breaks
        // frontend.

        // Let's modify the return type to Object and decide based on params?
        // Or better: Use a different endpoint /products/paginated?
        // Or simply checking if params are passed? But params have default values.

        // Strategy: Use the same endpoint but return PaginatedResponse
        // The frontend needs to be updated to handle this new structure.

        PaginatedResponse<ProductDTO> paginatedProducts = productService.getAllProducts(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(paginatedProducts));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieve a specific product by its ID for viewing details")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductById(@PathVariable Long id) {
        ProductDTO productDetail = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(productDetail));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get product by category", description = "Retrieve products by their category with optional pagination")
    public ResponseEntity<ApiResponse<Object>> getProductByCategory(
            @PathVariable String category,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        PaginatedResponse<ProductDTO> products = productService.getProductsByCategory(category,
                PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/search")
    @Operation(summary = "Search products with ML", description = "Search products using ML-powered semantic search with optional filters")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(required = false) Integer topK,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String category) {
        List<ProductDTO> products = searchService.searchProducts(keyword, topK, minPrice, maxPrice, category);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/{id}/recommendations")
    @Operation(summary = "Get product recommendations", description = "Get similar products recommended by ML service")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getRecommendations(@PathVariable Long id) {
        List<ProductDTO> products = recommendationService.getRecommendations(id);
        return ResponseEntity.ok(ApiResponse.success("Recommendations retrieved successfully", products));
    }

}
