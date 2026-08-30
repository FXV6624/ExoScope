"""remove is_superuser from user

Revision ID: e1f2a3b4c5d6
Revises: 5d779f7683ca
Create Date: 2026-08-30 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e1f2a3b4c5d6'
down_revision = '5d779f7683ca'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column('user', 'is_superuser')


def downgrade():
    op.add_column('user', sa.Column('is_superuser', sa.Boolean(), nullable=False, server_default=sa.text('false')))
