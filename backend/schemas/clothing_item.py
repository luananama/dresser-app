from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, computed_field, field_validator, model_validator

from backend.models.clothing_item import SUBCATEGORIES, Category, Season, Source


def _validate_subcategory(category: Category | None, subcategory: str | None) -> None:
    if subcategory and category:
        allowed = SUBCATEGORIES.get(category.value, [])
        if subcategory not in allowed:
            raise ValueError(
                f"'{subcategory}' is not a valid subcategory for {category.value}. "
                f"Allowed: {', '.join(allowed)}"
            )


class ClothingItemCreate(BaseModel):
    category: Category
    subcategory: Optional[str] = None
    source: Optional[Source] = None
    fabric: Optional[list[str]] = None
    date_acquired: Optional[date] = None
    season: Season = Season.all_year
    notes: Optional[str] = None

    @model_validator(mode="after")
    def check_subcategory(self):
        _validate_subcategory(self.category, self.subcategory)
        return self


class ClothingItemUpdate(BaseModel):
    category: Optional[Category] = None
    subcategory: Optional[str] = None
    source: Optional[Source] = None
    fabric: Optional[list[str]] = None
    date_acquired: Optional[date] = None
    season: Optional[Season] = None
    notes: Optional[str] = None

    @model_validator(mode="after")
    def check_subcategory(self):
        _validate_subcategory(self.category, self.subcategory)
        return self


class ClothingItemOut(BaseModel):
    id: int
    user_id: int
    category: Category
    subcategory: Optional[str]
    source: Optional[Source]
    fabric: Optional[list[str]]
    date_acquired: Optional[date]
    season: Season
    image_path: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    @field_validator("fabric", mode="before")
    @classmethod
    def parse_fabric(cls, v):
        if not v:
            return None
        if isinstance(v, list):
            return v
        return [f.strip() for f in v.split(",") if f.strip()]

    @computed_field
    @property
    def age_years(self) -> Optional[int]:
        if self.date_acquired is None:
            return None
        today = date.today()
        delta = today - self.date_acquired
        return delta.days // 365

    model_config = {"from_attributes": True}


class PaginatedItems(BaseModel):
    items: list[ClothingItemOut]
    total: int
    page: int
    size: int
