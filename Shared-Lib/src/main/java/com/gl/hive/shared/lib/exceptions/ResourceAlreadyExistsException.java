package com.gl.hive.shared.lib.exceptions;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.http.HttpStatus;

@Data
@EqualsAndHashCode(callSuper = true)
public class ResourceAlreadyExistsException extends RuntimeException {

    private HttpStatus httpStatus;
    private int statusCode;

    public ResourceAlreadyExistsException() {
    }

    public ResourceAlreadyExistsException(String message) {
        super(message);
    }

    public ResourceAlreadyExistsException(String message, HttpStatus httpStatus, int statusCode) {
        super(message);
        this.httpStatus = httpStatus;
        this.statusCode = statusCode;
    }

    public ResourceAlreadyExistsException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

}
