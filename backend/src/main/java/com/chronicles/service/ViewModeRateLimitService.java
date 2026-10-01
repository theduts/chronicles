package com.chronicles.service;

import com.chronicles.exception.LoginRateLimitException;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ViewModeRateLimitService {

    public static final int MAX_REQUESTS = 10;
    public static final long DURATION_SECONDS = 10;

    private final Clock clock;
    
    // Simplistic in-memory rate limiter for demonstration.
    // In a real distributed system, we'd use Redis or a distributed cache.
    private final Map<String, RateLimitData> rateLimiterMap = new ConcurrentHashMap<>();

    public ViewModeRateLimitService(Clock clock) {
        this.clock = clock;
    }

    public void checkAndRecord(String identifier) {
        Instant now = clock.instant();
        
        rateLimiterMap.compute(identifier, (key, data) -> {
            if (data == null || data.windowStart.plusSeconds(DURATION_SECONDS).isBefore(now)) {
                // New window
                return new RateLimitData(now, 1);
            }
            
            // Existing window
            if (data.count >= MAX_REQUESTS) {
                // Rate limit exceeded
                throw new LoginRateLimitException(Math.max(1, data.windowStart.plusSeconds(DURATION_SECONDS).getEpochSecond() - now.getEpochSecond()));
            }
            
            return new RateLimitData(data.windowStart, data.count + 1);
        });
    }
    
    private record RateLimitData(Instant windowStart, int count) {}
}
