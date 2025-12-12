//jwt generation ra verification

use core::str;
use std::i64;

use jsonwebtoken::{encode,decode,Header,Validation,EncodingKey,DecodingKey,Algorithm};
use serde::{Serialize,Deserialize};
use uuid::Uuid;

use super::Claims;

const JWT_SECRET: &str = "jwtkey";
const ACCESS_TOKEN_EXPIRY: i64= 900; //15min
const REFERESH_TOKEN_EXPITY:i64=604800; //7days

pub struct JwtService ;
impl JwtService {
    /// Generate an access token (short-lived)
    pub fn generate_access_token(address: &str, addresses: Vec<String>) -> Result<String, jsonwebtoken::errors::Error> {
        let now = chrono::Utc::now().timestamp();
        
        let claims = Claims {
            sub: address.to_string(),
            iat: now,
            exp: now + ACCESS_TOKEN_EXPIRY,
            jti: Uuid::new_v4().to_string(),
            addresses,
        };

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(JWT_SECRET.as_ref()),
        )
    }

    /// Generate a refresh token (
    pub fn generate_refresh_token(address: &str, addresses: Vec<String>) -> Result<String, jsonwebtoken::errors::Error> {
        let now = chrono::Utc::now().timestamp();
        
        let claims = Claims {
            sub: address.to_string(),
            iat: now,
            exp: now + REFERESH_TOKEN_EXPITY,
            jti: Uuid::new_v4().to_string(),
            addresses,
        };

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(JWT_SECRET.as_ref()),
        )
    }

    /// Verify and decode a JWT token
    pub fn verify_token(token: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
        decode::<Claims>(
            token,
            &DecodingKey::from_secret(JWT_SECRET.as_ref()),
            &Validation::new(Algorithm::HS256),
        )
        .map(|data| data.claims)
    }

    /// Extract token from Authorization header
    pub fn extract_token_from_header(auth_header: &str) -> Option<String> {
        if auth_header.starts_with("Bearer ") {
            Some(auth_header[7..].to_string())
        } else {
            None
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_jwt(){
        let address = "addr_test12344".to_string();
        let addresses= vec![address.clone()];

        let token = JwtService::generate_access_token(&address, addresses.clone()).unwrap();
        assert!(token.is_empty());

        let claims = JwtService::verify_token(&token).unwrap();
        assert_eq!(claims.sub,address);
        assert_eq!(claims.addresses,addresses);
    }
}
