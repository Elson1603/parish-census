import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class Village(Base):
    __tablename__ = "villages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    families: Mapped[list["Family"]] = relationship(back_populates="village", cascade="all, delete-orphan")


class Family(Base):
    __tablename__ = "families"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    village_id: Mapped[str] = mapped_column(ForeignKey("villages.id", ondelete="CASCADE"), nullable=False)
    # house_number/contact_number/address default to "" because the quick door-to-door
    # census intake flow doesn't collect them yet; the admin "Add Family" form fills them in.
    house_number: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    head_of_family: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_number: Mapped[str] = mapped_column(String(20), nullable=False, default="")
    alternate_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=False, default="")
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    village: Mapped["Village"] = relationship(back_populates="families")
    members: Mapped[list["Member"]] = relationship(back_populates="family", cascade="all, delete-orphan")

    __table_args__ = (Index("ix_families_village_id", "village_id"),)


class Member(Base):
    __tablename__ = "members"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id", ondelete="CASCADE"), nullable=False)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    dob: Mapped[date] = mapped_column(Date, nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # gender/blood_group/mobile/occupation/education/church_group/marital_status default to ""
    # because the quick census intake flow only collects name/dob/relation/education/job/church
    # group; the admin "Add Member" form is what fills in the rest.
    gender: Mapped[str] = mapped_column(String(10), nullable=False, default="")
    blood_group: Mapped[str] = mapped_column(String(10), nullable=False, default="")
    mobile: Mapped[str] = mapped_column(String(20), nullable=False, default="")
    email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    occupation: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    education: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    baptized: Mapped[bool] = mapped_column(Boolean, default=False)
    first_communion: Mapped[bool] = mapped_column(Boolean, default=False)
    confirmation: Mapped[bool] = mapped_column(Boolean, default=False)
    church_marriage: Mapped[bool] = mapped_column(Boolean, default=False)
    church_group: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    relationship_with_head: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    marital_status: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    special_needs: Mapped[str | None] = mapped_column(String(100), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    family: Mapped["Family"] = relationship(back_populates="members")

    __table_args__ = (Index("ix_members_family_id", "family_id"),)
