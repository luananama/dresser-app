import io
import uuid
from typing import Optional

import httpx
from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError
from pillow_heif import register_heif_opener

register_heif_opener()
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config import settings
from backend.models.clothing_item import Category, ClothingItem, Season
from backend.schemas.clothing_item import ClothingItemCreate, ClothingItemUpdate

MAX_DIMENSION = 1200
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


async def save_image(file: UploadFile, user_id: int) -> str:
    contents = await file.read()

    max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise ValueError(f"Image exceeds {settings.MAX_IMAGE_SIZE_MB}MB limit")

    try:
        img = Image.open(io.BytesIO(contents))
        img.load()
    except (UnidentifiedImageError, Exception) as e:
        raise ValueError("Unsupported image format. Please use JPEG, PNG, WEBP, or HEIC.")

    if max(img.width, img.height) > MAX_DIMENSION:
        img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)

    # Composite transparency onto white before saving
    if img.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        bg.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")

    ext, fmt, content_type = "jpg", "JPEG", "image/jpeg"
    save_kwargs: dict = {"quality": 85, "optimize": True}

    buf = io.BytesIO()
    img.save(buf, format=fmt, **save_kwargs)
    image_bytes = buf.getvalue()

    storage_path = f"{user_id}/{uuid.uuid4()}.{ext}"
    upload_url = f"{settings.SUPABASE_URL}/storage/v1/object/{settings.SUPABASE_BUCKET}/{storage_path}"

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            upload_url,
            headers={
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                "Content-Type": content_type,
            },
            content=image_bytes,
        )
        resp.raise_for_status()

    return f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_BUCKET}/{storage_path}"


async def delete_image(image_url: str) -> None:
    prefix = f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_BUCKET}/"
    if not image_url.startswith(prefix):
        return
    storage_path = image_url[len(prefix):]

    async with httpx.AsyncClient() as client:
        await client.delete(
            f"{settings.SUPABASE_URL}/storage/v1/object/{settings.SUPABASE_BUCKET}",
            headers={
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                "Content-Type": "application/json",
            },
            json={"prefixes": [storage_path]},
        )


def _serialize(data_dict: dict) -> dict:
    if data_dict.get("fabric") is not None:
        data_dict["fabric"] = ",".join(data_dict["fabric"])
    return data_dict


async def create_item(
    db: AsyncSession,
    user_id: int,
    data: ClothingItemCreate,
    image_path: Optional[str] = None,
) -> ClothingItem:
    item = ClothingItem(user_id=user_id, image_path=image_path, **_serialize(data.model_dump()))
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def get_items(
    db: AsyncSession,
    user_id: int,
    category: Optional[Category] = None,
    season: Optional[Season] = None,
    page: int = 1,
    size: int = 20,
) -> tuple[list[ClothingItem], int]:
    query = select(ClothingItem).where(ClothingItem.user_id == user_id)
    if category:
        query = query.where(ClothingItem.category == category)
    if season:
        query = query.where(ClothingItem.season == season)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()

    query = query.order_by(ClothingItem.created_at.desc()).offset((page - 1) * size).limit(size)
    items = (await db.execute(query)).scalars().all()
    return list(items), total


async def get_item(db: AsyncSession, item_id: int, user_id: int) -> Optional[ClothingItem]:
    result = await db.execute(
        select(ClothingItem).where(ClothingItem.id == item_id, ClothingItem.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def update_item(
    db: AsyncSession,
    item: ClothingItem,
    data: ClothingItemUpdate,
    new_image_path: Optional[str] = None,
) -> ClothingItem:
    for field, value in _serialize(data.model_dump(exclude_unset=True)).items():
        setattr(item, field, value)

    if new_image_path is not None:
        if item.image_path:
            await delete_image(item.image_path)
        item.image_path = new_image_path

    await db.commit()
    await db.refresh(item)
    return item


async def delete_item(db: AsyncSession, item: ClothingItem) -> None:
    if item.image_path:
        await delete_image(item.image_path)
    await db.delete(item)
    await db.commit()
