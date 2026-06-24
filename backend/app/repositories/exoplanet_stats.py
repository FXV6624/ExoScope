from sqlmodel import Session, func, select

from app.models import Exoplanet


def get_by_discovery_method(session: Session) -> list[tuple[str | None, int]]:
    """
    Returns number of exoplanets grouped by discovery method.
    """
    statement = (select(Exoplanet.discovery_method,func.count()).group_by(Exoplanet.discovery_method))

    return session.exec(statement).all()


def get_by_discovery_decade(session: Session) -> list[tuple[int, int]]:
    """
    Returns number of exoplanets grouped by discovery decade.
    """
    decade_expr = (Exoplanet.discovery_year // 10) * 10

    stmt = (select(decade_expr.label("decade"), func.count().label("count"))
        .where(Exoplanet.discovery_year.is_not(None)).group_by(decade_expr).order_by(decade_expr))

    return session.exec(stmt).all()
