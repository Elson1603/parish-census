import ssl
from collections.abc import AsyncGenerator
from urllib.parse import parse_qs, urlencode, urlsplit, urlunsplit

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


def _build_engine_args(url: str) -> tuple[str, dict]:
    """asyncpg doesn't understand libpq query params like sslmode/channel_binding,
    so strip them from the URL and translate sslmode into an ssl context instead."""
    parts = urlsplit(url)
    scheme = "postgresql+asyncpg" if parts.scheme == "postgresql" else parts.scheme
    query = parse_qs(parts.query)
    sslmode = query.pop("sslmode", ["prefer"])[0]
    query.pop("channel_binding", None)

    clean_url = urlunsplit((scheme, parts.netloc, parts.path, urlencode(query, doseq=True), ""))

    connect_args = {}
    if sslmode in ("require", "verify-ca", "verify-full"):
        connect_args["ssl"] = ssl.create_default_context()

    return clean_url, connect_args


_clean_url, _connect_args = _build_engine_args(settings.database_url)
engine = create_async_engine(_clean_url, pool_pre_ping=True, connect_args=_connect_args)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session
