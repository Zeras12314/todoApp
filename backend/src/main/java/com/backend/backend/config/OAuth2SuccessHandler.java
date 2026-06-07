package com.backend.backend.config;

import com.backend.backend.entity.User;
import com.backend.backend.service.JwtService;
import com.backend.backend.service.OAuth2UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
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

        //  Redirect to Angular callback (FIXED)
        String redirectUrl = "http://localhost:4200/oauth2/callback"
                + "?token=" + token
                + "&username=" + user.getUsername();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}