from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, TypeAdapter, field_validator

_email_adapter = TypeAdapter(EmailStr)

Gender = Literal["Male", "Female"]


def _blank_to_none(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


class VillageBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)


class VillageCreate(VillageBase):
    pass


class Village(VillageBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    total_families: int = Field(serialization_alias="totalFamilies")
    total_members: int = Field(serialization_alias="totalMembers")


class FamilyBase(BaseModel):
    village_id: str = Field(alias="villageId")
    house_number: str = Field(alias="houseNumber", min_length=1, max_length=50)
    head_of_family: str = Field(alias="headOfFamily", min_length=2, max_length=200)
    contact_number: str = Field(alias="contactNumber", min_length=1, max_length=20)
    alternate_number: str | None = Field(default=None, alias="alternateNumber", max_length=20)
    email: str | None = Field(default=None, max_length=200)
    address: str = Field(min_length=5)
    remarks: str | None = None

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("alternate_number", "email", "remarks", mode="before")
    @classmethod
    def _blank(cls, value: str | None) -> str | None:
        return _blank_to_none(value)

    @field_validator("email")
    @classmethod
    def _validate_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _email_adapter.validate_python(value)


class FamilyCreate(FamilyBase):
    pass


class Family(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    village_id: str = Field(serialization_alias="villageId")
    village_name: str = Field(serialization_alias="villageName")
    house_number: str = Field(serialization_alias="houseNumber")
    head_of_family: str = Field(serialization_alias="headOfFamily")
    contact_number: str = Field(serialization_alias="contactNumber")
    alternate_number: str | None = Field(default=None, serialization_alias="alternateNumber")
    email: str | None = None
    address: str
    remarks: str | None = None
    created_at: datetime = Field(serialization_alias="createdAt")


class MemberBase(BaseModel):
    family_id: str = Field(alias="familyId")
    full_name: str = Field(alias="fullName", min_length=2, max_length=200)
    gender: Gender
    dob: date
    photo_url: str | None = Field(default=None, alias="photoUrl", max_length=500)
    # occupation/education/church_group/blood_group used to be master-data-driven
    # dropdowns; that admin feature was removed, so the admin form no longer
    # collects them. They stay optional here so an edit that omits them doesn't
    # wipe out values already set by the census intake flow (see update_member).
    blood_group: str | None = Field(default=None, alias="bloodGroup", max_length=10)
    # Not required: the Edit Member form mirrors the census intake wizard, which
    # never requires a phone number either.
    mobile: str = Field(default="", max_length=20)
    email: str | None = Field(default=None, max_length=200)
    occupation: str | None = Field(default=None, max_length=100)
    education: str | None = Field(default=None, max_length=100)
    baptized: bool = False
    first_communion: bool = Field(default=False, alias="firstCommunion")
    confirmation: bool = False
    church_marriage: bool = Field(default=False, alias="churchMarriage")
    church_group: str | None = Field(default=None, alias="churchGroup", max_length=100)
    relationship_with_head: str = Field(alias="relationshipWithHead", min_length=1, max_length=50)
    # Not required: matches the census intake wizard, where marital status is optional.
    marital_status: str = Field(default="", alias="maritalStatus", max_length=50)
    special_needs: str | None = Field(default=None, alias="specialNeeds", max_length=100)
    remarks: str | None = None

    model_config = ConfigDict(populate_by_name=True)

    @field_validator(
        "photo_url", "email", "occupation", "education", "church_group", "blood_group",
        "special_needs", "remarks", mode="before",
    )
    @classmethod
    def _blank(cls, value: str | None) -> str | None:
        return _blank_to_none(value)


class MemberCreate(MemberBase):
    pass


class Member(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    family_id: str = Field(serialization_alias="familyId")
    village_id: str = Field(serialization_alias="villageId")
    village_name: str = Field(serialization_alias="villageName")
    house_number: str = Field(serialization_alias="houseNumber")
    full_name: str = Field(serialization_alias="fullName")
    # Loosened from the Gender literal: quick census-intake rows may not have gender set yet.
    gender: str
    dob: date
    age: int
    photo_url: str | None = Field(default=None, serialization_alias="photoUrl")
    blood_group: str = Field(serialization_alias="bloodGroup")
    mobile: str
    email: str | None = None
    occupation: str
    education: str
    baptized: bool
    first_communion: bool = Field(serialization_alias="firstCommunion")
    confirmation: bool
    church_marriage: bool = Field(serialization_alias="churchMarriage")
    church_group: str = Field(serialization_alias="churchGroup")
    relationship_with_head: str = Field(serialization_alias="relationshipWithHead")
    marital_status: str = Field(serialization_alias="maritalStatus")
    special_needs: str | None = Field(default=None, serialization_alias="specialNeeds")
    remarks: str | None = None
    created_at: datetime = Field(serialization_alias="createdAt")


class ChartDatum(BaseModel):
    name: str
    value: int


class ActivityItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    description: str
    timestamp: datetime


class DashboardStats(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total_villages: int = Field(serialization_alias="totalVillages")
    total_families: int = Field(serialization_alias="totalFamilies")
    total_members: int = Field(serialization_alias="totalMembers")
    male_members: int = Field(serialization_alias="maleMembers")
    female_members: int = Field(serialization_alias="femaleMembers")
    children: int
    youth: int
    senior_citizens: int = Field(serialization_alias="seniorCitizens")
    baptized: int
    first_communion: int = Field(serialization_alias="firstCommunion")
    confirmation: int
    church_marriage: int = Field(serialization_alias="churchMarriage")
    completed_families: int = Field(serialization_alias="completedFamilies")
    total_expected_families: int = Field(serialization_alias="totalExpectedFamilies")


class DashboardData(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    stats: DashboardStats
    village_population: list[ChartDatum] = Field(serialization_alias="villagePopulation")
    gender_distribution: list[ChartDatum] = Field(serialization_alias="genderDistribution")
    marital_status_distribution: list[ChartDatum] = Field(
        serialization_alias="maritalStatusDistribution"
    )
    occupation_distribution: list[ChartDatum] = Field(serialization_alias="occupationDistribution")
    age_distribution: list[ChartDatum] = Field(serialization_alias="ageDistribution")
    recent_families: list[Family] = Field(serialization_alias="recentFamilies")
    recent_members: list[Member] = Field(serialization_alias="recentMembers")
    timeline: list[ActivityItem]


class ReportFilter(BaseModel):
    village: str | None = None
    occupation: str | None = None
    education: str | None = None
    from_date: date | None = Field(default=None, alias="fromDate")
    to_date: date | None = Field(default=None, alias="toDate")

    model_config = ConfigDict(populate_by_name=True)


class ReportResultRow(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    label: str
    village: str
    families: int
    members: int
    male: int
    female: int


class SearchResult(BaseModel):
    id: str
    type: str
    label: str
    meta: str


class FamilyWithMembers(BaseModel):
    family: Family
    family_members: list[Member] = Field(serialization_alias="familyMembers")

    model_config = ConfigDict(populate_by_name=True)


class CensusMemberIntake(BaseModel):
    name: str = Field(min_length=1)
    phone: str | None = None
    dob: date
    gender: Gender
    marital_status: str | None = Field(default=None, alias="maritalStatus")
    relation: str
    education: str | None = None
    job: str | None = None
    church_group: str | None = Field(default=None, alias="churchGroup")
    special_remark: str | None = Field(default=None, alias="specialRemark")

    model_config = ConfigDict(populate_by_name=True)


class CensusFamilyIntake(BaseModel):
    village: str = Field(min_length=1)
    members: list[CensusMemberIntake] = Field(min_length=1)
