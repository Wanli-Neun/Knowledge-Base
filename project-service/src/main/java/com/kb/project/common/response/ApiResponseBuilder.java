package com.kb.project.common.response;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ApiResponseBuilder {

    private ApiResponseBuilder() {}

    static <T> ResponseEntity<ApiResponse<T>> build(HttpStatus status, String message, Object metadata, T result){
        ApiResponse<T> response = ApiResponse.<T>builder()
            .status(status.value())
            .message(message)
            .metadata(metadata)
            .result(result)
            .build();

        return ResponseEntity.status(status).body(response);
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(String message, Object metadata, T result){
        return build(HttpStatus.OK, message, metadata, result);
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(String message, T result){
        return success(message, null, result);
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(T result){
        return success("Success", null, result);
    }

    public static ResponseEntity<ApiResponse<Void>> success(){
        return success("Success", null, null);
    }
    
    public static <T> ResponseEntity<ApiResponse<T>> created(String message, Object metadata, T result){
        return build(HttpStatus.CREATED, message, metadata, result);
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(String message, T result){
        return created(message, null, result);
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(T result){
        return created("Created", null, result);
    }

    public static ResponseEntity<ApiResponse<Void>> created(){
        return created("Created", null, null);
    }

    public static ResponseEntity<ApiResponse<Void>> noContent(){
        return ResponseEntity.noContent().build();
    }

    public static ResponseEntity<ApiResponse<Void>> error(HttpStatus status, String message){
        return build(status, message, null, null);
    }

    public static ResponseEntity<ApiResponse<Void>> badRequest(String message){
        return error(HttpStatus.BAD_REQUEST, message);
    }

    public static ResponseEntity<ApiResponse<Void>> unauthorized(String message){
        return error(HttpStatus.UNAUTHORIZED, message);
    }

    public static ResponseEntity<ApiResponse<Void>> forbidden(String message){
        return error(HttpStatus.FORBIDDEN, message);
    }

    public static ResponseEntity<ApiResponse<Void>> notFound(String message){
        return error(HttpStatus.NOT_FOUND, message);
    }

    public static ResponseEntity<ApiResponse<Void>> internalServerError(String message){
        return error(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }
    
}
