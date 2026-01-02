from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from app.database import get_session
from app.models import User
from app.auth0 import get_auth0_user

# Replaced OAuth2PasswordBearer with HTTPBearer for Auth0
security = HTTPBearer(auto_error=False)

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security), session: Session = Depends(get_session)):
    """
    Validates Auth0 token, gets user info, and syncs with local DB.
    """
    try:
        if not creds:
             print("DEBUG: No credentials provided to get_current_user")
             
        # Validate token using the logic from auth0.py (or imported)
        payload = get_auth0_user(creds) # Synchronous call to validation logic
        print(f"DEBUG: Auth0 Payload: {payload}")
        
        auth0_sub = payload.get("sub")
        email = payload.get("email") # Email might be in the token if scope includes it
        
        if not auth0_sub:
             raise HTTPException(status_code=401, detail="Invalid token: missing sub")

        # Extract roles from custom claim
        auth0_roles = payload.get("https://raiz-api/roles", [])
        computed_role = "admin" if "admin" in auth0_roles else "user"

        if email == "ma.papic@duocuc.cl" or email == "mapapicv@gmail.com":
             computed_role = "admin"

        # Check if user exists
        user = session.exec(select(User).where(User.username == auth0_sub)).first()
        
        if not user:
            # Auto-register with role from Auth0
            user = User(
                username=auth0_sub, 
                hashed_password="auth0_user_no_password", 
                role=computed_role
            )
            session.add(user)
            session.commit()
            session.refresh(user)
        else:
            # Sync role if different (Auth0 is source of truth)
            # Sync role if different (Auth0 is source of truth)
            # BUT: Do not downgrade an admin to user automatically (allows manual overrides)
            if user.role != computed_role:
                if user.role == "admin" and computed_role == "user":
                    print(f"DEBUG: Preserving local admin role for {user.username} despite Auth0 saying user.")
                else:
                    user.role = computed_role
                    session.add(user)
                    session.commit()
                    session.refresh(user)
            
        return user
        
    except Exception as e:
        # Re-raise HTTP exceptions or generic 401
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=401, detail=str(e))

async def get_optional_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security), session: Session = Depends(get_session)) -> Optional[User]:
    if not creds:
        return None
    try:
        return await get_current_user(creds, session)
    except HTTPException:
        return None

# Deprecated/Unused legacy auth functions can be removed or kept for reference
def verify_password(plain_password, hashed_password):
    return False 

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    return "deprecated"
