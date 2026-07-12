import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.census import Family, Member, Village
from app.schemas import census as schemas
from app.services.queries import age_expr, family_select, member_select

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=schemas.DashboardData)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    total_villages = await db.scalar(select(func.count(Village.id))) or 0
    total_families = await db.scalar(select(func.count(Family.id))) or 0
    total_members = await db.scalar(select(func.count(Member.id))) or 0

    age = age_expr(Member.dob)
    stats_row = (
        await db.execute(
            select(
                func.count(case((Member.gender == "Male", 1))).label("male"),
                func.count(case((Member.gender == "Female", 1))).label("female"),
                func.count(case((age <= 12, 1))).label("children"),
                func.count(case((age.between(13, 25), 1))).label("youth"),
                func.count(case((age >= 60, 1))).label("seniors"),
                func.count(case((Member.baptized.is_(True), 1))).label("baptized"),
                func.count(case((Member.first_communion.is_(True), 1))).label("first_communion"),
                func.count(case((Member.confirmation.is_(True), 1))).label("confirmation"),
                func.count(case((Member.church_marriage.is_(True), 1))).label("church_marriage"),
            )
        )
    ).one()

    completed_families = await db.scalar(
        select(func.count(func.distinct(Member.family_id)))
    ) or 0

    stats = schemas.DashboardStats(
        total_villages=total_villages,
        total_families=total_families,
        total_members=total_members,
        male_members=stats_row.male,
        female_members=stats_row.female,
        children=stats_row.children,
        youth=stats_row.youth,
        senior_citizens=stats_row.seniors,
        baptized=stats_row.baptized,
        first_communion=stats_row.first_communion,
        confirmation=stats_row.confirmation,
        church_marriage=stats_row.church_marriage,
        completed_families=completed_families,
        total_expected_families=total_families,
    )

    village_population_rows = (
        await db.execute(
            select(Village.name, func.count(Member.id))
            .select_from(Village)
            .outerjoin(Family, Family.village_id == Village.id)
            .outerjoin(Member, Member.family_id == Family.id)
            .group_by(Village.id, Village.name)
            .order_by(Village.name)
        )
    ).all()
    village_population = [schemas.ChartDatum(name=name, value=value) for name, value in village_population_rows]

    gender_distribution = [
        schemas.ChartDatum(name="Male", value=stats_row.male),
        schemas.ChartDatum(name="Female", value=stats_row.female),
    ]

    occupation_rows = (
        await db.execute(
            select(Member.occupation, func.count(Member.id))
            .where(Member.occupation != "")
            .group_by(Member.occupation)
            .order_by(func.count(Member.id).desc())
            .limit(8)
        )
    ).all()
    occupation_distribution = [
        schemas.ChartDatum(name=name, value=value) for name, value in occupation_rows
    ]

    age_distribution = [
        schemas.ChartDatum(name="0-12", value=stats_row.children),
        schemas.ChartDatum(name="13-25", value=stats_row.youth),
        schemas.ChartDatum(
            name="26-59",
            value=total_members - stats_row.children - stats_row.youth - stats_row.seniors,
        ),
        schemas.ChartDatum(name="60+", value=stats_row.seniors),
    ]

    recent_family_rows = (
        await db.execute(family_select().order_by(Family.created_at.desc()).limit(5))
    ).all()
    recent_families = [schemas.Family.model_validate(dict(row._mapping)) for row in recent_family_rows]

    recent_member_rows = (
        await db.execute(member_select().order_by(Member.created_at.desc()).limit(6))
    ).all()
    recent_members = [schemas.Member.model_validate(dict(row._mapping)) for row in recent_member_rows]

    timeline_family_rows = (
        await db.execute(
            select(Family.head_of_family, Village.name, Family.created_at)
            .join(Village, Village.id == Family.village_id)
            .order_by(Family.created_at.desc())
            .limit(5)
        )
    ).all()
    timeline_member_rows = (
        await db.execute(
            select(Member.full_name, Village.name, Member.created_at)
            .join(Family, Family.id == Member.family_id)
            .join(Village, Village.id == Family.village_id)
            .order_by(Member.created_at.desc())
            .limit(5)
        )
    ).all()

    timeline_events = [
        schemas.ActivityItem(
            id=str(uuid.uuid4()),
            title="Family registered",
            description=f"{head} added in {village}",
            timestamp=created_at,
        )
        for head, village, created_at in timeline_family_rows
    ] + [
        schemas.ActivityItem(
            id=str(uuid.uuid4()),
            title="Member registered",
            description=f"{name} added in {village}",
            timestamp=created_at,
        )
        for name, village, created_at in timeline_member_rows
    ]
    timeline_events.sort(key=lambda item: item.timestamp, reverse=True)

    return schemas.DashboardData(
        stats=stats,
        village_population=village_population,
        gender_distribution=gender_distribution,
        occupation_distribution=occupation_distribution,
        age_distribution=age_distribution,
        recent_families=recent_families,
        recent_members=recent_members,
        timeline=timeline_events[:5],
    )
