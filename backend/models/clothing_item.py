import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


class Category(str, enum.Enum):
    tops = "tops"
    bottoms = "bottoms"
    full_body = "full_body"
    layer = "layer"
    footwear = "footwear"
    accessories = "accessories"


class Source(str, enum.Enum):
    thrifted = "thrifted"
    passed_down = "passed_down"
    gift = "gift"
    bought = "bought"
    handmade = "handmade"
    upcycled = "upcycled"
    other = "other"


class Season(str, enum.Enum):
    all_year = "all_year"
    summer = "summer"
    spring = "spring"
    winter = "winter"
    fall = "fall"


FABRICS = ["Cotton", "Wool", "Linen", "Nylon", "Polyester", "Silk", "Denim", "Leather", "Cashmere", "Viscose", "Acrylic", "Spandex"]

SUBCATEGORIES: dict[str, list[str]] = {
    "tops": ["Short sleeve", "Long sleeve", "Blouse", "Tank top", "Sweatshirt", "Button down", "Sweater", "Cardigan"],
    "bottoms": ["Pants", "Jeans", "Long skirt", "Short skirt", "Shorts"],
    "full_body": ["Long dress", "Short dress", "Swimsuit", "Overalls"],
    "layer": ["Coat", "Jacket", "Blazer", "Cardigan", "Hoodie", "Raincoat", "Vest"],
    "footwear": ["Boots", "Sandals", "Heels", "Flats", "Athletic"],
    "accessories": ["Bag", "Hat", "Scarf", "Other"],
}


class ClothingItem(Base):
    __tablename__ = "clothing_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    category: Mapped[Category] = mapped_column(Enum(Category), nullable=False)
    subcategory: Mapped[str | None] = mapped_column(String(50), nullable=True)
    source: Mapped[Source | None] = mapped_column(Enum(Source), nullable=True)
    fabric: Mapped[str | None] = mapped_column(Text, nullable=True)
    date_acquired: Mapped[date | None] = mapped_column(Date, nullable=True)
    season: Mapped[Season] = mapped_column(Enum(Season), nullable=False, default=Season.all_year)
    image_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
