"""rename outerwear to layer, drop name, fabric to text

Revision ID: a1b2c3d4e5f6
Revises: 6de0bb6dc3cf
Create Date: 2026-05-17 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '6de0bb6dc3cf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename enum value outerwear -> layer
    op.execute("ALTER TYPE category RENAME VALUE 'outerwear' TO 'layer'")

    # Drop the name column
    op.drop_column('clothing_items', 'name')

    # Change fabric from VARCHAR(100) to TEXT (no data loss, just wider type)
    op.alter_column(
        'clothing_items', 'fabric',
        existing_type=sa.String(100),
        type_=sa.Text(),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        'clothing_items', 'fabric',
        existing_type=sa.Text(),
        type_=sa.String(100),
        existing_nullable=True,
    )

    op.add_column('clothing_items', sa.Column('name', sa.String(100), nullable=True))

    op.execute("ALTER TYPE category RENAME VALUE 'layer' TO 'outerwear'")
