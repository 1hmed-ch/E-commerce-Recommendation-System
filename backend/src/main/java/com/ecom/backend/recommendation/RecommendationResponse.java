package com.ecom.backend.recommendation;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class RecommendationResponse {
    @JsonProperty("product_ids")
    private List<Long> productIds;
}
