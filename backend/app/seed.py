"""Seeds villages so the admin dropdowns aren't empty on first run.

Village names come from the frontend's VILLAGE_OPTIONS (census-form-options.ts) — the real
villages of the parish.

Run with: uv run python -m app.seed
"""

import asyncio

from sqlalchemy import select

from app.database import async_session_factory
from app.models.census import Village

VILLAGES = [
    "Katerwadi",
    "Raiwadi-Pantar-Gonbhat",
    "Malodi",
    "Satkar-Visrodi-Panwadi",
    "Navale",
    "Runpal",
    "Katerwadi-Mainroad",
    "Shirlai",
    "Barodi-Purapada",
    "Ghondar-Chafewadi",
    "Thombodi-Guradi",
    "Dhakalwadi (Madhli)",
    "Gothodi-Umbergoathan-Gopal.Ganesh.Nagar",
    "Mothodi",
    "Dhakalwadi-Mainroad",
    "Daiswadi",
]


async def seed() -> None:
    async with async_session_factory() as db:
        existing_villages = set((await db.scalars(select(Village.name))).all())
        for name in VILLAGES:
            if name not in existing_villages:
                db.add(Village(name=name))

        await db.commit()
    print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
