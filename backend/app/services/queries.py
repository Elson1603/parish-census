from sqlalchemy import Integer, case, cast, func, select
from sqlalchemy.sql import Select

from app.models.census import Family, Member, Village


def age_expr(dob_column):
    return cast(func.date_part("year", func.age(func.current_date(), dob_column)), Integer)


def family_head_name_expr():
    """Use the current Head member name, falling back to the family's saved label."""
    current_head_name = (
        select(Member.full_name)
        .where(
            Member.family_id == Family.id,
            func.lower(Member.relationship_with_head) == "head",
        )
        .order_by(Member.created_at, Member.id)
        .limit(1)
        .scalar_subquery()
    )
    return func.coalesce(current_head_name, Family.head_of_family)


def family_primary_mobile_expr():
    """Prefer the Head's mobile, then another member's, then family contact."""
    current_head_mobile = (
        select(Member.mobile)
        .where(
            Member.family_id == Family.id,
            func.nullif(Member.mobile, "").is_not(None),
        )
        .order_by(
            case((func.lower(Member.relationship_with_head) == "head", 0), else_=1),
            Member.created_at,
            Member.id,
        )
        .limit(1)
        .scalar_subquery()
    )
    return func.coalesce(func.nullif(current_head_mobile, ""), Family.contact_number)


def family_select() -> Select:
    """Family joined with its village and current head member name."""
    return select(
        Family.id,
        Family.village_id,
        Village.name.label("village_name"),
        family_head_name_expr().label("head_of_family"),
        family_primary_mobile_expr().label("contact_number"),
        Family.alternate_number,
        Family.email,
        Family.address,
        Family.remarks,
        Family.created_at,
    ).join(Village, Village.id == Family.village_id)


def member_select() -> Select:
    """Member joined with its family's village, columns ordered for schemas.Member."""
    return select(
        Member.id,
        Member.family_id,
        Family.village_id,
        Village.name.label("village_name"),
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
