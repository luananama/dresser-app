from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.dependencies import get_current_user
from backend.models.clothing_item import Category, Season, Source
from backend.models.user import User
from backend.schemas.clothing_item import ClothingItemCreate, ClothingItemOut, ClothingItemUpdate, PaginatedItems
from backend.services import clothing_item as svc

router = APIRouter()


def _parse_fabric(fabric: Optional[str]) -> Optional[list[str]]:
    if not fabric:
        return None
    return [f.strip() for f in fabric.split(",") if f.strip()]


@router.get("/", response_model=PaginatedItems)
async def list_items(
    category: Optional[Category] = Query(None),
    season: Optional[Season] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    items, total = await svc.get_items(db, current_user.id, category, season, page, size)
    return PaginatedItems(items=items, total=total, page=page, size=size)


@router.post("/", response_model=ClothingItemOut, status_code=status.HTTP_201_CREATED)
async def create_item(
    category: Category = Form(...),
    subcategory: Optional[str] = Form(None),
    source: Optional[Source] = Form(None),
    fabric: Optional[str] = Form(None),
    date_acquired: Optional[str] = Form(None),
    season: Season = Form(Season.all_year),
    notes: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import date as date_type

    parsed_date = None
    if date_acquired:
        try:
            parsed_date = date_type.fromisoformat(date_acquired)
        except ValueError:
            raise HTTPException(status_code=422, detail="date_acquired must be in YYYY-MM-DD format")

    image_path = None
    if image and image.filename:
        try:
            image_path = await svc.save_image(image, current_user.id)
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))

    data = ClothingItemCreate(
        category=category,
        subcategory=subcategory,
        source=source,
        fabric=_parse_fabric(fabric),
        date_acquired=parsed_date,
        season=season,
        notes=notes,
    )
    item = await svc.create_item(db, current_user.id, data, image_path)
    return item


@router.get("/{item_id}", response_model=ClothingItemOut)
async def get_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    item = await svc.get_item(db, item_id, current_user.id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.put("/{item_id}", response_model=ClothingItemOut)
async def update_item(
    item_id: int,
    category: Optional[Category] = Form(None),
    subcategory: Optional[str] = Form(None),
    source: Optional[Source] = Form(None),
    fabric: Optional[str] = Form(None),
    date_acquired: Optional[str] = Form(None),
    season: Optional[Season] = Form(None),
    notes: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import date as date_type

    item = await svc.get_item(db, item_id, current_user.id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    parsed_date = None
    if date_acquired is not None:
        try:
            parsed_date = date_type.fromisoformat(date_acquired)
        except ValueError:
            raise HTTPException(status_code=422, detail="date_acquired must be in YYYY-MM-DD format")

    new_image_path = None
    if image and image.filename:
        try:
            new_image_path = await svc.save_image(image, current_user.id)
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))

    update_kwargs: dict = {}
    if category is not None: update_kwargs["category"] = category
    if subcategory is not None: update_kwargs["subcategory"] = subcategory
    if source is not None: update_kwargs["source"] = source
    if fabric is not None: update_kwargs["fabric"] = _parse_fabric(fabric)
    if date_acquired is not None: update_kwargs["date_acquired"] = parsed_date
    if season is not None: update_kwargs["season"] = season
    if notes is not None: update_kwargs["notes"] = notes
    update_data = ClothingItemUpdate(**update_kwargs)
    item = await svc.update_item(db, item, update_data, new_image_path)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_200_OK)
async def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    item = await svc.get_item(db, item_id, current_user.id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    await svc.delete_item(db, item)
    return {"message": "Item deleted"}
