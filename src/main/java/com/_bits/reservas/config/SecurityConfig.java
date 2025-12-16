package com._bits.reservas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Desactiva CSRF solo para pruebas
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Habilita CORS
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos del frontend
                .requestMatchers(HttpMethod.POST, "/reservas/registro").permitAll()
                .requestMatchers(HttpMethod.GET, "/reservas/cliente/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/reservas/checkin").permitAll()
                .requestMatchers(HttpMethod.GET, "/reservas/checkout").permitAll()
                .requestMatchers(HttpMethod.GET, "/habitaciones/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/reservas/buscar").permitAll()
                .requestMatchers(HttpMethod.POST, "/habitaciones/crear").permitAll() // Nuevo para tu formulario
                .requestMatchers(HttpMethod.POST, "/tipos/crearTipo").permitAll()
                .requestMatchers(HttpMethod.GET, "/tipos/listar").permitAll()
                .requestMatchers(HttpMethod.GET, "/enums/estadosHabitacion").permitAll()
                .requestMatchers(HttpMethod.PUT, "/habitaciones/{id}").permitAll()
                // El resto requiere autenticación
                .anyRequest().authenticated()
            )
            .httpBasic();

        return http.build();
    }

    // Configuración CORS, Ahora permite todos los origines SUPUESTAMENTE
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Todos los origines
        config.addAllowedOriginPattern("*"); // Permite todos los origines
        // Métodos permitidos
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        // Cabeceras permitidas
        config.setAllowedHeaders(List.of("*"));
        // Permitir credenciales (cookies, autenticación HTTP, etc.)
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
