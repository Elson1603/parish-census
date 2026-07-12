from sqlalchemy import Integer, cast, func, select
from sqlalchemy.sql import Select

from app.models.census import Family, Member, Village


def age_expr(dob_column):
    return cast(func.date_part("year", func.age(func.current_date(), dob_column)), Integer)


def family_select() -> Select:
    """Family joined with its village name, columns ordered for schemas.Family construction."""
    return select(
        Family.id,
        Family.village_id,
        Village.name.label("village_name"),
        Family.house_number,
        Family.head_of_family,
        Family.contact_number,
        Family.alternate_number,
        Family.email,
        Family.address,
        Family.remarks,
        Family.created_at,
    ).join(Village, Village.id == Family.village_id)


def member_select() -> Select:
    """Member joined with its family's village/house number, columns ordered for schemas.Member."""
    return select(
        Member.id,
        Member.family_id,
        Family.village_id,
        Village.name.label("village_name"),
        Family.house_number,
        Member.full_name,
        Member.gender,
        Member.dob,
        age_expr(Member.dob).label("age"),
        Member.photo_url,
        Member.blood_group,
        Member.mobile,
        Member.email,
        Member.occupation,
        Member.education,
        Member.baptized,
        Member.first_communion,
        Member.confirmation,
        Member.church_marriage,
        Member.church_group,
        Member.relationship_with_head,
        Member.marital_status,
        Member.special_needs,
        Member.remarks,
        Member.created_at,
    ).join(Family, Family.id == Member.family_id).join(Village, Village.id == Family.village_id)
