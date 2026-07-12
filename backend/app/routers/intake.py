from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.census import Family, Member
from app.schemas import census as schemas
from app.services.mobile_uniqueness import assert_mobile_available
from app.services.village_lookup import get_or_create_village

router = APIRouter(tags=["intake"])


@router.post("/census/intake")
async def submit_family_census(payload: schemas.CensusFamilyIntake, db: AsyncSession = Depends(get_db)):
    submitted_phones = [m.phone for m in payload.members if m.phone]
    if len(submitted_phones) != len(set(submitted_phones)):
        raise HTTPException(
            status_code=409, detail="Two members in this family have the same phone number"
        )
    for phone in submitted_phones:
        await assert_mobile_available(db, phone)

    village = await get_or_create_village(db, payload.village)

    head = payload.members[0]
    family = Family(
        village_id=village.id,
        head_of_family=head.name,
        contact_number=head.phone or "",
    )
    db.add(family)
    await db.flush()

    for index, member_input in enumerate(payload.members):
        db.add(
            Member(
                family_id=family.id,
                full_name=member_input.name,
                dob=member_input.dob,
                gender=member_input.gender,
                marital_status=member_input.marital_status or "",
                mobile=member_input.phone or "",
                occupation=member_input.job or "",
                education=member_input.education or "",
                church_group=member_input.church_group or "",
                relationship_with_head="Head" if index == 0 else member_input.relation,
                remarks=member_input.special_remark,
            )
        )

    await db.commit()
    return {"ok": True, "message": "Family census saved"}


# The frontend autosaves in-progress form state so users don't lose work on a
# refresh; there is no server-side draft schema (yet), so we simply acknowledge.
@router.post("/drafts/family")
async def save_family_draft(payload: dict[str, Any]):
    return {"ok": True, "data": payload}


@router.post("/drafts/member")
async def save_member_draft(payload: dict[str, Any]):
    return {"ok": True, "data": payload}
