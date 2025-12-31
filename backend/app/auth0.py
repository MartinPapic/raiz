import os
import json
from typing import Optional
from urllib.request import urlopen
from jose import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

AUTH0_DOMAIN = "dev-i5umzfyrt885qu7g.us.auth0.com"
API_AUDIENCE = "https://raiz-api"
ALGORITHMS = ["RS256"]

class Auth0User:
    def __init__(self, payload):
        self.sub = payload.get("sub")
        self.permissions = payload.get("permissions", [])
        self.email = payload.get("email") # Needs email scope

security = HTTPBearer()

def get_auth0_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    token = creds.credentials
    
    try:
        jsonurl = urlopen(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json")
        jwks = json.loads(jsonurl.read())
        unverified_header = jwt.get_unverified_header(token)
        
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
        
        if rsa_key:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=API_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/"
            )
            return payload
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token is expired")
    except jwt.JWTClaimsError:
        raise HTTPException(status_code=401, detail="Incorrect claims, please check the audience and issuer")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Unable to parse authentication token: {str(e)}")
        
    raise HTTPException(status_code=401, detail="Unable to find appropriate key")
