import hashlib
import re
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.dependencies import get_current_user
from backend.models.user import User
from backend.schemas.user import (
    ForgotPasswordRequest,
    GoogleLoginRequest,
    ResetPasswordRequest,
    TokenOut,
    UserCreate,
    UserLogin,
    UserOut,
)
from backend.services.auth import (
    create_access_token,
    generate_reset_token,
    hash_password,
    verify_password,
)

router = APIRouter()


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate, db: AsyncSession = Depends(get_db)):
    existing_email = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = (await db.execute(select(User).where(User.username == body.username))).scalar_one_or_none()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=body.email,
        username=body.username,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenOut)
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if user is None or user.hashed_password is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    # Always return success to avoid email enumeration
    if user is None:
        return {"message": "If that email is registered, a reset token has been issued"}

    raw_token = generate_reset_token()
    user.password_reset_token = hashlib.sha256(raw_token.encode()).hexdigest()
    user.password_reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    await db.commit()

    # Phase 1: return token directly (no email). Phase 2 replaces this with email sending.
    return {
        "message": "Password reset token issued",
        "reset_token": raw_token,
    }


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    token_hash = hashlib.sha256(body.token.encode()).hexdigest()
    result = await db.execute(select(User).where(User.password_reset_token == token_hash))
    user = result.scalar_one_or_none()

    if user is None or user.password_reset_expires is None:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    expires = user.password_reset_expires
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Reset token has expired")

    user.hashed_password = hash_password(body.new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    await db.commit()

    return {"message": "Password updated successfully"}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


def _slugify_username(raw: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9_-]", "", raw)
    return slug[:50] or "user"


@router.post("/google", response_model=TokenOut)
async def google_login(body: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as http:
        resp = await http.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {body.credential}"},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid Google token")

    info = resp.json()
    google_id: str = info["sub"]
    email: str = info["email"]
    display_name: str = info.get("name", "") or email.split("@")[0]

    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if user is None:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            user.google_id = google_id
        else:
            base = _slugify_username(display_name)
            username = base
            suffix = 1
            while (await db.execute(select(User).where(User.username == username))).scalar_one_or_none():
                username = f"{base}{suffix}"
                suffix += 1
            user = User(email=email, username=username, google_id=google_id)
            db.add(user)

    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))
