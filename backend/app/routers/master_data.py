from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.census import MasterDataItem
from app.schemas import census as schemas

router = APIRouter(prefix="/master-data", tags=["master-data"])


def _validate_key(key: str) -> str:
    if key not in schemas.MASTER_DATA_KEYS:
        raise HTTPException(status_code=404, detail=f"Unknown master data category: {key}")
    return key


@router.get("/{key}", response_model=list[schemas.EntityItem])
async def list_master_data(key: str, db: AsyncSession = Depends(get_db)):
    _validate_key(key)
    stmt = select(MasterDataItem).where(MasterDataItem.category == key).order_by(MasterDataItem.name)
    rows = (await db.scalars(stmt)).all()
    return [schemas.EntityItem.model_validate(row) for row in rows]


@router.post("/{key}", response_model=schemas.EntityItem, status_code=201)
async def create_master_data_item(
    key: str, payload: schemas.MasterDataCreate, db: AsyncSession = Depends(get_db)
):
    _validate_key(key)
    existing = await db.scalar(
        select(MasterDataItem).where(
            MasterDataItem.category == key, MasterDataItem.name == payload.name.strip()
        )
    )
    if existing:
        raise HTTPException(status_code=409, detail="Item already exists")

    item = MasterDataItem(category=key, name=payload.name.strip())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return schemas.EntityItem.model_validate(item)


@router.put("/{key}/{item_id}", response_model=schemas.EntityItem)
async def update_master_data_item(
    key: str, item_id: str, payload: schemas.MasterDataUpdate, db: AsyncSession = Depends(get_db)
):
    _validate_key(key)
    item = await db.get(MasterDataItem, item_id)
    if not item or item.category != key:
        raise HTTPException(status_code=404, detail="Item not found")

    item.name = payload.name.strip()
    await db.commit()
    await db.refresh(item)
    return schemas.EntityItem.model_validate(item)


@router.delete("/{key}/{item_id}", status_code=204)
async def delete_master_data_item(key: str, item_id: str, db: AsyncSession = Depends(get_db)):
    _validate_key(key)
    item = await db.get(MasterDataItem, item_id)
    if not item or item.category != key:
        raise HTTPException(status_code=404, detail="Item not found")

    await db.delete(item)
    await db.commit()
