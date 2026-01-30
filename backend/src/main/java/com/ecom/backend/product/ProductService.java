package com.ecom.backend.product;

import com.ecom.backend.product.dto.ProductDTO;
import com.ecom.backend.utile.MapperUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository productRepository;

    public List<ProductDTO> getAllProducts() {
        return productRepository.findByAvailableTrue().stream()
                .map(MapperUtil::toProductDTO).collect(Collectors.toList());
    }

    public List<ProductDTO> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndAvailableTrue(category).stream()
                .map(MapperUtil::toProductDTO).collect(Collectors.toList());
    }

    public List<ProductDTO> searchProducts(String keyword) {
        return productRepository.searchProducts(keyword).stream()
                .map(MapperUtil::toProductDTO).collect(Collectors.toList());
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Product not found with id : " + id));
        return MapperUtil.toProductDTO(product);
    }

    public List<ProductDTO> getProductsByIds(List<Long> ids) {
        return productRepository.findAllById(ids).stream().filter(Product::getAvailable)
                .map(MapperUtil::toProductDTO).collect(Collectors.toList());
    }

    public  Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id : " + id));
    }
}
