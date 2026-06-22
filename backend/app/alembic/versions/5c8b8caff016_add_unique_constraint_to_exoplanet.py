"""add unique constraint to exoplanet

Revision ID: 5c8b8caff016
Revises: 858f2045fb17
Create Date: 2026-06-22 09:21:33.464973

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '5c8b8caff016'
down_revision = '858f2045fb17'
branch_labels = None
depends_on = None


def upgrade():
    op.create_unique_constraint(
        "uq_planet_star",
        "exoplanet",
        ["planet_name", "host_star"]
    )


def downgrade():
    op.drop_constraint(
        "uq_planet_star",
        "exoplanet",
        type_="unique"
    )
