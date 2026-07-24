"""add planet_class fields

Revision ID: a1b2c3d4e5f6
Revises: fd7e460d2f8d
Create Date: 2026-07-23 11:50:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'fd7e460d2f8d'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('exoplanet', sa.Column('planet_class', sa.String(), nullable=True))
    op.add_column('exoplanet', sa.Column('planet_class_confidence', sa.Float(), nullable=True))


def downgrade():
    op.drop_column('exoplanet', 'planet_class_confidence')
    op.drop_column('exoplanet', 'planet_class')
