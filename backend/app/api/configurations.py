from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Configuration, ConfigurationComponent, Item
from app.schemas.configuration import (
    ConfigurationCreate,
    ConfigurationUpdate,
    ConfigurationResponse,
    ConfigurationComponentInput,
    ConfigurationComponentResponse,
)

router = APIRouter(prefix="/configurations", tags=["configurations"])


def get_config_with_components(db: Session, config_id: int) -> dict | None:
    """Get configuration with component details."""
    config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not config:
        return None

    components = []
    for cc in (
        db.query(ConfigurationComponent)
        .filter(ConfigurationComponent.configuration_id == config_id)
        .all()
    ):
        item = db.query(Item).filter(Item.id == cc.item_id).first()
        components.append(
            ConfigurationComponentResponse(
                id=cc.id,
                item_id=cc.item_id,
                quantity=cc.quantity,
                item_name=item.name if item else None,
                item_sku=item.sku if item else None,
            )
        )

    return {
        "id": config.id,
        "name": config.name,
        "description": config.description,
        "archived": config.archived,
        "created_at": config.created_at,
        "components": components,
    }


@router.get("/", response_model=list[ConfigurationResponse])
def list_configurations(archived: bool | None = None, db: Session = Depends(get_db)):
    """Get all configurations, optionally filtered by archived status."""
    query = db.query(Configuration)
    if archived is not None:
        query = query.filter(Configuration.archived == archived)
    configs = query.order_by(Configuration.name).all()
    return [get_config_with_components(db, c.id) for c in configs]


@router.get("/{config_id}", response_model=ConfigurationResponse)
def get_configuration(config_id: int, db: Session = Depends(get_db)):
    """Get a single configuration by ID."""
    result = get_config_with_components(db, config_id)
    if not result:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return result


@router.post("/", response_model=ConfigurationResponse, status_code=201)
def create_configuration(config_in: ConfigurationCreate, db: Session = Depends(get_db)):
    """Create a new configuration with components."""
    # Create configuration
    config = Configuration(
        name=config_in.name,
        description=config_in.description,
    )
    db.add(config)
    db.flush()

    # Add components
    for comp in config_in.components:
        item = db.query(Item).filter(Item.id == comp.item_id).first()
        if not item:
            raise HTTPException(
                status_code=400, detail=f"Item {comp.item_id} not found"
            )
        cc = ConfigurationComponent(
            configuration_id=config.id,
            item_id=comp.item_id,
            quantity=comp.quantity,
        )
        db.add(cc)

    db.commit()
    return get_config_with_components(db, config.id)


@router.patch("/{config_id}", response_model=ConfigurationResponse)
def update_configuration(
    config_id: int, config_in: ConfigurationUpdate, db: Session = Depends(get_db)
):
    """Update a configuration's name and description."""
    config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")

    update_data = config_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)

    db.commit()
    return get_config_with_components(db, config.id)


@router.post("/{config_id}/archive", response_model=ConfigurationResponse)
def archive_configuration(config_id: int, db: Session = Depends(get_db)):
    """Archive a configuration."""
    config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")

    config.archived = True
    db.commit()
    return get_config_with_components(db, config.id)


@router.post("/{config_id}/unarchive", response_model=ConfigurationResponse)
def unarchive_configuration(config_id: int, db: Session = Depends(get_db)):
    """Unarchive a configuration."""
    config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")

    config.archived = False
    db.commit()
    return get_config_with_components(db, config.id)


@router.post(
    "/{config_id}/duplicate", response_model=ConfigurationResponse, status_code=201
)
def duplicate_configuration(config_id: int, db: Session = Depends(get_db)):
    """Duplicate a configuration with all its components."""
    original = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Configuration not found")

    # Create new configuration
    new_config = Configuration(
        name=f"{original.name} (Copy)",
        description=original.description,
    )
    db.add(new_config)
    db.flush()

    # Copy components
    original_components = (
        db.query(ConfigurationComponent)
        .filter(ConfigurationComponent.configuration_id == config_id)
        .all()
    )
    for cc in original_components:
        new_cc = ConfigurationComponent(
            configuration_id=new_config.id,
            item_id=cc.item_id,
            quantity=cc.quantity,
        )
        db.add(new_cc)

    db.commit()
    return get_config_with_components(db, new_config.id)


@router.post("/{config_id}/components", response_model=ConfigurationResponse)
def add_component(
    config_id: int,
    component: ConfigurationComponentInput,
    db: Session = Depends(get_db),
):
    """Add a component to a configuration."""
    config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")

    item = db.query(Item).filter(Item.id == component.item_id).first()
    if not item:
        raise HTTPException(status_code=400, detail="Item not found")

    # Check if component already exists
    existing = (
        db.query(ConfigurationComponent)
        .filter(
            ConfigurationComponent.configuration_id == config_id,
            ConfigurationComponent.item_id == component.item_id,
        )
        .first()
    )
    if existing:
        # Update quantity instead
        existing.quantity = component.quantity
    else:
        cc = ConfigurationComponent(
            configuration_id=config_id,
            item_id=component.item_id,
            quantity=component.quantity,
        )
        db.add(cc)

    db.commit()
    return get_config_with_components(db, config_id)


@router.delete(
    "/{config_id}/components/{component_id}", response_model=ConfigurationResponse
)
def remove_component(config_id: int, component_id: int, db: Session = Depends(get_db)):
    """Remove a component from a configuration."""
    config = db.query(Configuration).filter(Configuration.id == config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")

    cc = (
        db.query(ConfigurationComponent)
        .filter(
            ConfigurationComponent.id == component_id,
            ConfigurationComponent.configuration_id == config_id,
        )
        .first()
    )
    if not cc:
        raise HTTPException(status_code=404, detail="Component not found")

    db.delete(cc)
    db.commit()
    return get_config_with_components(db, config_id)
