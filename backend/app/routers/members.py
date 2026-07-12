from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.census import Family, Member
from app.schemas import census as schemas
from app.services.queries import member_select

router = APIRouter(prefix="/members", tags=["members"])


@router.get("", response_model=list[schemas.Member])
async def list_members(
    search: str | None = Query(default=None),
    village: str | None = Query(default=None),
    occupation: str | None = Query(default=None),
    education: str | None = Query(default=None),
    gender: str | None = Query(default=None),
    bloodGroup: str | None = Query(default=None),
    churchGroup: str | None = Query(default=None),
    specialNeeds: str | None = Query(default=None),
    maritalStatus: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    stmt = member_select()

    if search:
        pattern = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Member.full_name).like(pattern),
                Member.mobile.like(f"%{search.strip()}%"),
                func.lower(Family.house_number).like(pattern),
            )
        )
    if village and village != "all":
        stmt = stmt.where(Family.village_id == village)
    if occupation and occupation != "all":
        stmt = stmt.where(Member.occupation == occupation)
    if education and education != "all":
        stmt = stmt.where(Member.education == education)
    if gender and gender != "all":
        stmt = stmt.where(Member.gender == gender)
    if bloodGroup and bloodGroup != "all":
        stmt = stmt.where(Member.blood_group == bloodGroup)
    if churchGroup and churchGroup != "all":
        stmt = stmt.where(Member.church_group == churchGroup)
    if specialNeeds and specialNeeds != "all":
        stmt = stmt.where(Member.special_needs == specialNeeds)
    if maritalStatus and maritalStatus != "all":
        stmt = stmt.where(Member.marital_status == maritalStatus)

    stmt = stmt.order_by(Member.created_at.desc())
    rows = (await db.execute(stmt)).all()
    return [schemas.Member.model_validate(dict(row._mapping)) for row in rows]


@router.get("/{member_id}", response_model=schemas.Member)
async def get_member(member_id: str, db: AsyncSession = Depends(get_db)):
    row = (await db.execute(member_select().where(Member.id == member_id))).first()
    if not row:
        raise HTTPException(status_code=404, detail="Member not found")
    return schemas.Member.model_validate(dict(row._mapping))


@router.post("", response_model=schemas.Member, status_code=201)
async def create_member(payload: schemas.MemberCreate, db: AsyncSession = Depends(get_db)):
    family = await db.get(Family, payload.family_id)
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    member = Member(
        family_id=payload.family_id,
        full_name=payload.full_name,
        gender=payload.gender,
        dob=payload.dob,
        photo_url=payload.photo_url,
        blood_group=payload.blood_group,
        mobile=payload.mobile,
        email=payload.email,
        occupation=payload.occupation,
        education=payload.education,
        baptized=payload.baptized,
        first_communion=payload.first_communion,
        confirmation=payload.confirmation,
        church_marriage=payload.church_marriage,
        church_group=payload.church_group,
        relationship_with_head=payload.relationship_with_head,
        marital_status=payload.marital_status,
        special_needs=payload.special_needs,
        remarks=payload.remarks,
    )
    db.add(member)
    await db.commit()

    row = (await db.execute(member_select().where(Member.id == member.id))).first()
    return schemas.Member.model_validate(dict(row._mapping))


@router.put("/{member_id}", response_model=schemas.Member)
async def update_member(member_id: str, payload: schemas.MemberCreate, db: AsyncSession = Depends(get_db)):
    member = await db.get(Member, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    family = await db.get(Family, payload.family_id)
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    member.family_id = payload.family_id
    member.full_name = payload.full_name
    member.gender = payload.gender
    member.dob = payload.dob
    member.photo_url = payload.photo_url
    member.blood_group = payload.blood_group
    member.mobile = payload.mobile
    member.email = payload.email
    member.occupation = payload.occupation
    member.education = payload.education
    member.baptized = payload.baptized
    member.first_communion = payload.first_communion
    member.confirmation = payload.confirmation
    member.church_marriage = payload.church_marriage
    member.church_group = payload.church_group
    member.relationship_with_head = payload.relationship_with_head
    member.marital_status = payload.marital_status
    member.special_needs = payload.special_needs
    member.remarks = payload.remarks
    await db.commit()

    row = (await db.execute(member_select().where(Member.id == member.id))).first()
    return schemas.Member.model_validate(dict(row._mapping))
