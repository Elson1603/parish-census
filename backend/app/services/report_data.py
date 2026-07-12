"""Fetches the summary + detail rows for each report type.

Every report type produces the same shape (ReportData): an optional summary
table (counts by category), a detail table (the underlying member/family
rows), and - only for dashboard-statistics - chart definitions that get
rendered as images for the PDF export.
"""

from dataclasses import dataclass, field

from fastapi import HTTPException
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.census import Family, Member, Village
from app.services.queries import age_expr, family_select, member_select


@dataclass
class ReportTable:
    headers: list[str]
    rows: list[list[str]]


@dataclass
class ReportChart:
    title: str
    kind: str  # "bar" | "pie"
    labels: list[str]
    values: list[float]


@dataclass
class ReportData:
    report_type: str
    title: str
    description: str
    detail: ReportTable
    summary: ReportTable | None = None
    charts: list[ReportChart] = field(default_factory=list)


REPORT_DEFINITIONS: list[tuple[str, str, str]] = [
    (
        "dashboard-statistics",
        "Dashboard Statistics",
        "Overview of villages, families, members, and demographic charts.",
    ),
    (
        "village-population",
        "Village Population",
        "Family and member counts per village, with a gender breakdown.",
    ),
    ("family", "Family Report", "Full list of registered families."),
    ("member", "Member Report", "Full list of registered members."),
    ("age", "Age Report", "Age group breakdown with the full member listing."),
    ("gender", "Gender Report", "Gender breakdown with the full member listing."),
    (
        "marital-status",
        "Marital Status Report",
        "Marital status breakdown with the full member listing.",
    ),
    (
        "education",
        "Education Report",
        "Education level breakdown with the full member listing.",
    ),
    ("job", "Job Report", "Occupation breakdown with the full member listing."),
    (
        "church-group",
        "Church Group Report",
        "Church group participation breakdown with the full member listing.",
    ),
    (
        "special-remark",
        "Special Remark Report",
        "Members with a recorded special remark.",
    ),
]

REPORT_TYPES = {r[0] for r in REPORT_DEFINITIONS}


def _row_get(row, key: str):
    return row._mapping[key]


async def _member_rows(db: AsyncSession):
    return (await db.execute(member_select())).all()


async def get_report_data(report_type: str, db: AsyncSession) -> ReportData:
    if report_type not in REPORT_TYPES:
        raise HTTPException(status_code=404, detail=f"Unknown report type: {report_type}")

    definition = next(r for r in REPORT_DEFINITIONS if r[0] == report_type)
    _, title, description = definition

    if report_type == "dashboard-statistics":
        return await _dashboard_statistics_report(db, title, description)
    if report_type == "village-population":
        return await _village_population_report(db, title, description)
    if report_type == "family":
        return await _family_report(db, title, description)
    if report_type == "member":
        return await _member_report(db, title, description)
    if report_type == "age":
        return await _age_report(db, title, description)
    if report_type == "gender":
        return await _gender_report(db, title, description)
    if report_type == "marital-status":
        return await _marital_status_report(db, title, description)
    if report_type == "education":
        return await _education_report(db, title, description)
    if report_type == "job":
        return await _job_report(db, title, description)
    if report_type == "church-group":
        return await _church_group_report(db, title, description)
    if report_type == "special-remark":
        return await _special_remark_report(db, title, description)

    raise HTTPException(status_code=404, detail=f"Unknown report type: {report_type}")


async def _village_population_report(db: AsyncSession, title: str, description: str) -> ReportData:
    rows = (
        await db.execute(
            select(
                Village.name,
                func.count(func.distinct(Family.id)),
                func.count(Member.id),
                func.count(case((Member.gender == "Male", 1))),
                func.count(case((Member.gender == "Female", 1))),
            )
            .select_from(Village)
            .outerjoin(Family, Family.village_id == Village.id)
            .outerjoin(Member, Member.family_id == Family.id)
            .group_by(Village.id, Village.name)
            .order_by(Village.name)
        )
    ).all()

    table = ReportTable(
        headers=["Village", "Families", "Members", "Male", "Female"],
        rows=[
            [name, str(families), str(members), str(male), str(female)]
            for name, families, members, male, female in rows
        ],
    )
    return ReportData(
        report_type="village-population",
        title=title,
        description=description,
        detail=table,
        summary=table,
    )


async def _family_report(db: AsyncSession, title: str, description: str) -> ReportData:
    rows = (await db.execute(family_select().order_by(Village.name, Family.head_of_family))).all()
    return ReportData(
        report_type="family",
        title=title,
        description=description,
        detail=ReportTable(
            headers=[
                "Head of Family",
                "House No.",
                "Village",
                "Contact",
                "Alternate",
                "Email",
                "Address",
                "Remarks",
            ],
            rows=[
                [
                    _row_get(row, "head_of_family"),
                    _row_get(row, "house_number"),
                    _row_get(row, "village_name"),
                    _row_get(row, "contact_number"),
                    _row_get(row, "alternate_number") or "",
                    _row_get(row, "email") or "",
                    _row_get(row, "address"),
                    _row_get(row, "remarks") or "",
                ]
                for row in rows
            ],
        ),
    )


async def _member_report(db: AsyncSession, title: str, description: str) -> ReportData:
    rows = await _member_rows(db)
    return ReportData(
        report_type="member",
        title=title,
        description=description,
        detail=ReportTable(
            headers=[
                "Name",
                "Village",
                "House No.",
                "Gender",
                "Age",
                "Mobile",
                "Occupation",
                "Education",
                "Church Group",
                "Marital Status",
                "Relationship",
            ],
            rows=[
                [
                    _row_get(row, "full_name"),
                    _row_get(row, "village_name"),
                    _row_get(row, "house_number"),
                    _row_get(row, "gender") or "",
                    str(_row_get(row, "age")),
                    _row_get(row, "mobile") or "",
                    _row_get(row, "occupation") or "",
                    _row_get(row, "education") or "",
                    _row_get(row, "church_group") or "",
                    _row_get(row, "marital_status") or "",
                    _row_get(row, "relationship_with_head") or "",
                ]
                for row in rows
            ],
        ),
    )


async def _age_report(db: AsyncSession, title: str, description: str) -> ReportData:
    rows = await _member_rows(db)
    buckets = {"0-12": 0, "13-25": 0, "26-59": 0, "60+": 0}

    def bucket_for(age: int) -> str:
        if age <= 12:
            return "0-12"
        if age <= 25:
            return "13-25"
        if age < 60:
            return "26-59"
        return "60+"

    detail_rows = []
    for row in rows:
        age = _row_get(row, "age")
        buckets[bucket_for(age)] += 1
        detail_rows.append(
            [
                _row_get(row, "full_name"),
                _row_get(row, "village_name"),
                str(age),
                bucket_for(age),
                _row_get(row, "gender") or "",
            ]
        )

    return ReportData(
        report_type="age",
        title=title,
        description=description,
        summary=ReportTable(
            headers=["Age Group", "Count"],
            rows=[[label, str(count)] for label, count in buckets.items()],
        ),
        detail=ReportTable(
            headers=["Name", "Village", "Age", "Age Group", "Gender"],
            rows=detail_rows,
        ),
    )


async def _gender_report(db: AsyncSession, title: str, description: str) -> ReportData:
    rows = await _member_rows(db)
    counts: dict[str, int] = {}
    detail_rows = []
    for row in rows:
        gender = _row_get(row, "gender") or "Not specified"
        counts[gender] = counts.get(gender, 0) + 1
        detail_rows.append(
            [
                _row_get(row, "full_name"),
                _row_get(row, "village_name"),
                gender,
                str(_row_get(row, "age")),
                _row_get(row, "mobile") or "",
            ]
        )

    return ReportData(
        report_type="gender",
        title=title,
        description=description,
        summary=ReportTable(
            headers=["Gender", "Count"], rows=[[k, str(v)] for k, v in counts.items()]
        ),
        detail=ReportTable(headers=["Name", "Village", "Gender", "Age", "Mobile"], rows=detail_rows),
    )


async def _marital_status_report(db: AsyncSession, title: str, description: str) -> ReportData:
    rows = await _member_rows(db)
    counts: dict[str, int] = {}
    detail_rows = []
    for row in rows:
        status = _row_get(row, "marital_status") or "Not specified"
        counts[status] = counts.get(status, 0) + 1
        detail_rows.append(
            [
                _row_get(row, "full_name"),
                _row_get(row, "village_name"),
                status,
                str(_row_get(row, "age")),
                _row_get(row, "gender") or "",
            ]
        )

    return ReportData(
        report_type="marital-status",
        title=title,
        description=description,
        summary=ReportTable(
            headers=["Marital Status", "Count"], rows=[[k, str(v)] for k, v in counts.items()]
        ),
        detail=ReportTable(
            headers=["Name", "Village", "Marital Status", "Age", "Gender"], rows=detail_rows
        ),
    )


async def _education_report(db: AsyncSession, title: str, description: str) -> ReportData:
    rows = await _member_rows(db)
    counts: dict[str, int] = {}
    detail_rows = []
    for row in rows:
        education = _row_get(row, "education") or "Not specified"
        counts[education] = counts.get(education, 0) + 1
        detail_rows.append(
            [
                _row_get(row, "full_name"),
                _row_get(row, "village_name"),
                education,
                str(_row_get(row, "age")),
                _row_get(row, "occupation") or "",
            ]
        )

    return ReportData(
        report_type="education",
        title=title,
        description=description,
        summary=ReportTable(
            headers=["Education", "Count"], rows=[[k, str(v)] for k, v in counts.items()]
        ),
        detail=ReportTable(
            headers=["Name", "Village", "Education", "Age", "Occupation"], rows=detail_rows
        ),
    )


async def _job_report(db: AsyncSession, title: str, description: str) -> ReportData:
    rows = await _member_rows(db)
    counts: dict[str, int] = {}
    detail_rows = []
    for row in rows:
        job = _row_get(row, "occupation") or "Not specified"
        counts[job] = counts.get(job, 0) + 1
        detail_rows.append(
            [
                _row_get(row, "full_name"),
                _row_get(row, "village_name"),
                job,
                str(_row_get(row, "age")),
                _row_get(row, "education") or "",
            ]
        )

    return ReportData(
        report_type="job",
        title=title,
        description=description,
        summary=ReportTable(headers=["Job", "Count"], rows=[[k, str(v)] for k, v in counts.items()]),
        detail=ReportTable(headers=["Name", "Village", "Job", "Age", "Education"], rows=detail_rows),
    )


async def _church_group_report(db: AsyncSession, title: str, description: str) -> ReportData:
    rows = await _member_rows(db)
    counts: dict[str, int] = {}
    detail_rows = []
    for row in rows:
        group = _row_get(row, "church_group") or "Not specified"
        counts[group] = counts.get(group, 0) + 1
        detail_rows.append(
            [
                _row_get(row, "full_name"),
                _row_get(row, "village_name"),
                group,
                str(_row_get(row, "age")),
                _row_get(row, "gender") or "",
            ]
        )

    return ReportData(
        report_type="church-group",
        title=title,
        description=description,
        summary=ReportTable(
            headers=["Church Group", "Count"], rows=[[k, str(v)] for k, v in counts.items()]
        ),
        detail=ReportTable(
            headers=["Name", "Village", "Church Group", "Age", "Gender"], rows=detail_rows
        ),
    )


async def _special_remark_report(db: AsyncSession, title: str, description: str) -> ReportData:
    rows = await _member_rows(db)
    detail_rows = [
        [
            _row_get(row, "full_name"),
            _row_get(row, "village_name"),
            _row_get(row, "house_number"),
            _row_get(row, "remarks") or "",
        ]
        for row in rows
        if (_row_get(row, "remarks") or "").strip()
    ]

    return ReportData(
        report_type="special-remark",
        title=title,
        description=description,
        detail=ReportTable(headers=["Name", "Village", "House No.", "Remark"], rows=detail_rows),
    )


async def _dashboard_statistics_report(db: AsyncSession, title: str, description: str) -> ReportData:
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
            )
        )
    ).one()
    adults = total_members - stats_row.children - stats_row.youth - stats_row.seniors

    village_pop_rows = (
        await db.execute(
            select(Village.name, func.count(Member.id))
            .select_from(Village)
            .outerjoin(Family, Family.village_id == Village.id)
            .outerjoin(Member, Member.family_id == Family.id)
            .group_by(Village.id, Village.name)
            .order_by(Village.name)
        )
    ).all()

    occupation_rows = (
        await db.execute(
            select(Member.occupation, func.count(Member.id))
            .where(Member.occupation != "")
            .group_by(Member.occupation)
            .order_by(func.count(Member.id).desc())
            .limit(8)
        )
    ).all()

    marital_rows = (
        await db.execute(
            select(Member.marital_status, func.count(Member.id))
            .where(Member.marital_status != "")
            .group_by(Member.marital_status)
            .order_by(func.count(Member.id).desc())
        )
    ).all()

    summary = ReportTable(
        headers=["Statistic", "Value"],
        rows=[
            ["Total Villages", str(total_villages)],
            ["Total Families", str(total_families)],
            ["Total Members", str(total_members)],
            ["Male Members", str(stats_row.male)],
            ["Female Members", str(stats_row.female)],
            ["Children (0-12)", str(stats_row.children)],
            ["Youth (13-25)", str(stats_row.youth)],
            ["Adults (26-59)", str(adults)],
            ["Senior Citizens (60+)", str(stats_row.seniors)],
        ],
    )

    recent_member_rows = (await db.execute(member_select().order_by(Member.created_at.desc()).limit(10))).all()
    detail = ReportTable(
        headers=["Name", "Village", "Gender", "Age", "Created At"],
        rows=[
            [
                _row_get(row, "full_name"),
                _row_get(row, "village_name"),
                _row_get(row, "gender") or "",
                str(_row_get(row, "age")),
                _row_get(row, "created_at").strftime("%Y-%m-%d"),
            ]
            for row in recent_member_rows
        ],
    )

    charts = [
        ReportChart(
            title="Village-wise Population",
            kind="bar",
            labels=[name for name, _ in village_pop_rows],
            values=[float(value) for _, value in village_pop_rows],
        ),
        ReportChart(
            title="Gender Distribution",
            kind="pie",
            labels=["Male", "Female"],
            values=[float(stats_row.male), float(stats_row.female)],
        ),
        ReportChart(
            title="Occupation Distribution",
            kind="bar",
            labels=[name for name, _ in occupation_rows],
            values=[float(value) for _, value in occupation_rows],
        ),
        ReportChart(
            title="Age Distribution",
            kind="bar",
            labels=["0-12", "13-25", "26-59", "60+"],
            values=[float(stats_row.children), float(stats_row.youth), float(adults), float(stats_row.seniors)],
        ),
    ]
    if marital_rows:
        charts.append(
            ReportChart(
                title="Marital Status Distribution",
                kind="pie",
                labels=[name for name, _ in marital_rows],
                values=[float(value) for _, value in marital_rows],
            )
        )

    return ReportData(
        report_type="dashboard-statistics",
        title=title,
        description=description,
        summary=summary,
        detail=detail,
        charts=charts,
    )
