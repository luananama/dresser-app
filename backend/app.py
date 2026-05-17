from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings


def _cors_origins() -> list[str]:
    return [o.strip() for o in settings.CORS_ORIGINS.split(",")]


def create_app() -> FastAPI:
    app = FastAPI(title="Dresser API", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from backend.routers import auth, clothing_items

    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(clothing_items.router, prefix="/api/items", tags=["items"])

    return app
