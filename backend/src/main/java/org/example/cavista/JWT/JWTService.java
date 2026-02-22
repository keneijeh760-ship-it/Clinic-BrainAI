package org.example.cavista.JWT;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JWTService {
    private static final String SECRET_KEY = "25ba5ad9a25f203589f467c28ad3a5965c90dd4f381e7596080d94ba16763130";

    public String extractUsername(String token){
        return extractClaims(token, Claims:: getSubject);
    }

    public <T> T extractClaims(String token, Function<Claims, T> function) {
        Claims claims = extractAllClaims(token);
        return function.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> claims, UserDetails userDetails) {
        return Jwts
                .builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 24 * 60))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        return (userDetails.getUsername().equals(extractUsername(token)) && isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return ExtractExpiration(token).before(new Date());
    }

    private Date ExtractExpiration(String token) {
        return extractClaims(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token).getBody();
    }

    private Key getSignInKey() {
        byte [] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
