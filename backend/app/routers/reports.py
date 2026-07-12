from dataclasses import asdict

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import census as schemas
from app.services.report_data import REPORT_DEFINITIONS, get_report_data
from app.services.report_render import render_csv, render_excel, render_pdf

router = APIRouter(prefix="/reports", tags=["reports"])

_CONTENT_TYPES = {
    "pdf": "application/pdf",
    "excel": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "csv": "text/csv",
}
_EXTENSIONS = {"pdf": "pdf", "excel": "xlsx", "csv": "csv"}
_RENDERERS = {"pdf": render_pdf, "excel": render_excel, "csv": render_csv}


@router.get("", response_model=list[schemas.ReportDefinition])
async def list_reports():
    return [
        schemas.ReportDefinition(report_type=report_type, title=title, description=description)
        for report_type, title, description in REPORT_DEFINITIONS
    ]


@router.get("/{report_type}", response_model=schemas.ReportDataOut)
async def get_report(report_type: str, db: AsyncSession = Depends(get_db)):
    report = await get_report_data(report_type, db)
    return schemas.ReportDataOut(**asdict(report))


@router.get("/{report_type}/export")
async def export_report(
    report_type: str,
    format: str = Query(pattern="^(pdf|excel|csv)$"),
    mode: str = Query(default="attachment", pattern="^(attachment|inline)$"),
    db: AsyncSession = Depends(get_db),
):
    report = await get_report_data(report_type, db)
    file_bytes = _RENDERERS[format](report)
    filename = f"{report_type}-report.{_EXTENSIONS[format]}"

    return Response(
        content=file_bytes,
        media_type=_CONTENT_TYPES[format],
        headers={"Content-Disposition": f'{mode}; filename="{filename}"'},
    )
