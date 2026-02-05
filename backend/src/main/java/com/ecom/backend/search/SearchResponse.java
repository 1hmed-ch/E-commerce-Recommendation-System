package com.ecom.backend.search;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResponse {
    @JsonProperty("product_ids")
    private List<Long> productIds;

    private Integer count;

    private String query;
}
