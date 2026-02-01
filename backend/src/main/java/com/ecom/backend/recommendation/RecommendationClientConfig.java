package com.ecom.backend.recommendation;

import feign.Logger;
import feign.Request;
import feign.Retryer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class RecommendationClientConfig {
    @Value("${recommendation.service.timeout:5000}")
    private int timeout;

    @Bean
    public Request.Options requestOptions(){
        return new Request.Options(timeout, TimeUnit.MILLISECONDS, timeout, TimeUnit.MILLISECONDS, true);
    }

    @Bean
    public Retryer retryer(){
        return new Retryer.Default(100, 1000, 3);
    }

    @Bean
    Logger.Level feignLoggerLevel(){
        return Logger.Level.BASIC;
    }
}
