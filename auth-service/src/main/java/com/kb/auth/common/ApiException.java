package com.kb.auth.common;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Custom exception class for API error handling
 * Provides unified exception handling across all API endpoints
 */
@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String message;
    private final String errorCode;

    /**
     * Constructor with status and message
     */
    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
        this.message = message;
        this.errorCode = null;
    }

    /**
     * Constructor with status, message and error code
     */
    public ApiException(HttpStatus status, String message, String errorCode) {
        super(message);
        this.status = status;
        this.message = message;
        this.errorCode = errorCode;
    }

    /**
     * Constructor with status, message and cause
     */
    public ApiException(HttpStatus status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
        this.message = message;
        this.errorCode = null;
    }

    /**
     * Constructor with all parameters
     */
    public ApiException(HttpStatus status, String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.status = status;
        this.message = message;
        this.errorCode = errorCode;
    }

    // Convenience factory methods for common HTTP status codes

    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(HttpStatus.FORBIDDEN, message);
    }

    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, message);
    }

    public static ApiException conflict(String message) {
        return new ApiException(HttpStatus.CONFLICT, message);
    }

    public static ApiException internalServerError(String message) {
        return new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }

    public static ApiException serviceUnavailable(String message) {
        return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, message);
    }

}
