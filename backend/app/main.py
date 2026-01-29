from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.items import router as items_router

app = FastAPI(title="inv-sys", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items_router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok"}
