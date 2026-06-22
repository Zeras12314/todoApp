package com.backend.backend.config;

import com.backend.backend.entity.User;
import com.backend.backend.service.JwtService;
import com.backend.backend.service.OAuth2UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final OAuth2UserService oAuth2UserService;
    private final JwtService jwtService;

    @Value("${frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // get provider from the authentication token
        String provider = "google";
        if (authentication instanceof OAuth2AuthenticationToken token) {
            provider = token.getAuthorizedClientRegistrationId(); // returns "google" or "facebook"
        }

        // Save / find user
        User user = oAuth2UserService.processOAuth2User(oAuth2User, provider);
        // Generate JWT
        String token = jwtService.generateToken(user.getUsername());

        // Set httpOnly cookie instead of exposing token in the URL
        response.addHeader(HttpHeaders.SET_COOKIE, CookieUtil.buildTokenCookie(token).toString());

        // Drop the OAuth2 session — from here on, the JWT cookie is the only auth.
        // Otherwise the session restores an OAuth2User principal on later requests
        // and bypasses the JwtFilter.
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();

        // Clean redirect — no token, no username in the URL
        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/oauth2/callback");
    }
}