from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.census import Family, Member, Village
from app.schemas import census as schemas

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=list[schemas.SearchResult])
async def global_search(q: str = Query(default=""), db: AsyncSession = Depends(get_db)):
    query = q.strip().lower()
    if not query:
        return []

    pattern = f"%{query}%"

    member_rows = (
        await db.execute(
            select(Member.id, Member.full_name, Member.mobile, Member.occupation, Village.name)
            .join(Family, Family.id == Member.family_id)
            .join(Village, Village.id == Family.village_id)
            .where(
                or_(
                    func.lower(Member.full_name).like(pattern),
                    Member.mobile.like(f"%{q.strip()}%"),
                    func.lower(Member.occupation).like(pattern),
                )
            )
            .limit(8)
        )
    ).all()
    member_matches = [
        schemas.SearchResult(id=id_, type="Member", label=name, meta=f"{village} · {mobile}")
        for id_, name, mobile, _occupation, village in member_rows
    ]

    family_rows = (
        await db.execute(
            select(Family.id, Family.head_of_family, Family.house_number, Village.name)
            .join(Village, Village.id == Family.village_id)
            .where(
                or_(
                    func.lower(Family.head_of_family).like(pattern),
                    func.lower(Family.house_number).like(pattern),
                    func.lower(Village.name).like(pattern),
                )
            )
            .limit(8)
        )
    ).all()
    family_matches = [
        schemas.SearchResult(id=id_, type="Family", label=f"{head} ({house})", meta=village)
        for id_, head, house, village in family_rows
    ]

    village_count_subquery = (
        select(Family.village_id, func.count(Member.id).label("total_members"))
        .join(Member, Member.family_id == Family.id)
        .group_by(Family.village_id)
        .subquery()
    )
    village_rows = (
        await db.execute(
            select(Village.id, Village.name, func.coalesce(village_count_subquery.c.total_members, 0))
            .outerjoin(village_count_subquery, village_count_subquery.c.village_id == Village.id)
            .where(func.lower(Village.name).like(pattern))
            .limit(8)
        )
    ).all()
    village_matches = [
        schemas.SearchResult(id=id_, type="Village", label=name, meta=f"{total} members")
        for id_, name, total in village_rows
    ]

    return (member_matches + family_matches + village_matches)[:8]
