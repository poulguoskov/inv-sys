from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.items import router as items_router
from app.api.configurations import router as configurations_router
from app.api.assemblies import router as assemblies_router

app = FastAPI(title="inv-sys", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items_router, prefix="/api")
app.include_router(configurations_router, prefix="/api")
app.include_router(assemblies_router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok"}
