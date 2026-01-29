package com.ecom.backend.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByAvailableTrue();
    List<Product> findByCategoryAndAvailableTrue(String category);

    @Query("SELECT p FROM Product p WHERE p.available = true AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Product> searchProducts(String keyword);

    Optional<Product> findByIdAndAvailableTrue(Long id);
}
