"""Seeds villages and master data lists so the admin dropdowns aren't empty on first run.

Village names come from the frontend's VILLAGE_OPTIONS (census-form-options.ts) — the real
villages of the parish. Master data categories come from the frontend's mock-data.ts, which
already curated a starter list for each category; all of it stays editable afterwards via the
Master Data Manager UI.

Run with: uv run python -m app.seed
"""

import asyncio

from sqlalchemy import select

from app.database import async_session_factory
from app.models.census import MasterDataItem, Village

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

MASTER_DATA = {
    "occupations": ["Teacher", "Nurse", "Engineer", "Student", "Retired"],
    "education": ["Primary", "Higher Secondary", "Graduate", "Postgraduate", "Diploma"],
    "churchGroups": ["Choir", "Legion of Mary", "Youth Movement", "Sunday School"],
    "maritalStatus": ["Single", "Married", "Widowed"],
    "bloodGroups": ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"],
    "specialNeeds": ["None", "Mobility Assistance", "Vision Assistance"],
}


async def seed() -> None:
    async with async_session_factory() as db:
        existing_villages = set((await db.scalars(select(Village.name))).all())
        for name in VILLAGES:
            if name not in existing_villages:
                db.add(Village(name=name))

        for category, names in MASTER_DATA.items():
            existing_items = set(
                (
                    await db.scalars(
                        select(MasterDataItem.name).where(MasterDataItem.category == category)
                    )
                ).all()
            )
            for name in names:
                if name not in existing_items:
                    db.add(MasterDataItem(category=category, name=name))

        await db.commit()
    print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
