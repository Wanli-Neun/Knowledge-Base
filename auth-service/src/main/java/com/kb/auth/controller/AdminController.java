package com.kb.auth.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kb.auth.common.response.ApiResponse;
import com.kb.auth.common.response.ApiResponseBuilder;
import com.kb.auth.dto.response.TimeSeriesDataPoint;
import com.kb.auth.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats/users")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getUserStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        UserStatsResponse stats = UserStatsResponse.builder()
                .total(userService.getTotalUsers(startDate, endDate))
                .active(userService.getActiveUsers(startDate, endDate))
                .inactive(userService.getInactiveUsers(startDate, endDate))
                .build();
        return ApiResponseBuilder.success("Get user stats successfully", stats);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats/users/timeseries")
    public ResponseEntity<ApiResponse<List<TimeSeriesDataPoint>>> getUserTimeSeries(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        List<TimeSeriesDataPoint> timeSeries = userService.getUserTimeSeries(days, startDate, endDate);
        return ApiResponseBuilder.success("Get user time series successfully", timeSeries);
    }
}

class UserStatsResponse {
    private long total;
    private long active;
    private long inactive;

    public static Builder builder() {
        return new Builder();
    }

    public long getTotal() {
        return total;
    }

    public long getActive() {
        return active;
    }

    public long getInactive() {
        return inactive;
    }

    public static class Builder {
        private long total;
        private long active;
        private long inactive;

        public Builder total(long total) {
            this.total = total;
            return this;
        }

        public Builder active(long active) {
            this.active = active;
            return this;
        }

        public Builder inactive(long inactive) {
            this.inactive = inactive;
            return this;
        }

        public UserStatsResponse build() {
            UserStatsResponse response = new UserStatsResponse();
            response.total = this.total;
            response.active = this.active;
            response.inactive = this.inactive;
            return response;
        }
    }
}
