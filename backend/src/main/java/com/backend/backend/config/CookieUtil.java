package com.backend.backend.config;

import org.springframework.http.ResponseCookie;

import java.time.Duration;

public class CookieUtil {

    public static final String ACCESS_TOKEN = "access_token";

    public static ResponseCookie buildTokenCookie(String jwt) {
        return ResponseCookie.from(ACCESS_TOKEN, jwt)
                .httpOnly(true)
                .secure(false)              // set true in production (https)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofHours(24)) // matches JWT expiration
                .build();
    }

    public static ResponseCookie buildClearCookie() {
        return ResponseCookie.from(ACCESS_TOKEN, "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }
}