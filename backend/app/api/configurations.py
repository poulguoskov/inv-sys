from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Configuration
from app.schemas.configuration import (
    ConfigurationCreate,
    ConfigurationUpdate,
    ConfigurationResponse,
)

router = APIRouter(prefix="/configurations", tags=["configurations"])


@router.get("/", response_model=list[ConfigurationResponse])
def list_configurations(db: Session = Depends(get_db)):
    """Get all configurations."""
    return db.query(Configuration).all()


@router.get("/{config_id}", response_model=ConfigurationResponse)
def get_configuration(config_id: int, db: Session = Depends(get_db)):
    """Get a single configuration by ID."""
    config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config


@router.post("/", response_model=ConfigurationResponse, status_code=201)
def create_configuration(config_in: ConfigurationCreate, db: Session = Depends(get_db)):
    """Create a new configuration."""
    config = Configuration(**config_in.model_dump())
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


@router.patch("/{config_id}", response_model=ConfigurationResponse)
def update_configuration(
    config_id: int, config_in: ConfigurationUpdate, db: Session = Depends(get_db)
):
    """Update a configuration."""
    config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")

    update_data = config_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)

    db.commit()
    db.refresh(config)
    return config


@router.delete("/{config_id}", status_code=204)
def delete_configuration(config_id: int, db: Session = Depends(get_db)):
    """Delete a configuration."""
    config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")

    db.delete(config)
    db.commit()
