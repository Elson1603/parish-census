from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import dashboard, families, intake, members, reports, search, villages

app = FastAPI(title="Parish Census API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    # Vite bumps to the next free port (8080 -> 8081 -> ...) whenever one is taken,
    # so pin dev origins by regex instead of chasing the exact port each time.
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(villages.router)
app.include_router(families.router)
app.include_router(members.router)
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(search.router)
app.include_router(intake.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
