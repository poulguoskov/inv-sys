from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Assembly, AssemblyComponent, Item, ConfigurationComponent
from app.schemas.assembly import (
    AssemblyCreate,
    AssemblyUpdate,
    AssemblyResponse,
    AssemblyComponentResponse,
    AssemblyComponentBase,
)

router = APIRouter(prefix="/assemblies", tags=["assemblies"])


def get_assembly_with_components(db: Session, assembly_id: int) -> dict | None:
    """Get assembly with component details."""
    assembly = db.query(Assembly).filter(Assembly.id == assembly_id).first()
    if not assembly:
        return None

    components = []
    for ac in (
        db.query(AssemblyComponent)
        .filter(AssemblyComponent.assembly_id == assembly_id)
        .all()
    ):
        item = db.query(Item).filter(Item.id == ac.item_id).first()
        components.append(
            AssemblyComponentResponse(
                id=ac.id,
                item_id=ac.item_id,
                quantity=ac.quantity,
                item_name=item.name if item else None,
                item_sku=item.sku if item else None,
            )
        )

    return {
        "id": assembly.id,
        "configuration_id": assembly.configuration_id,
        "status": assembly.status,
        "order_reference": assembly.order_reference,
        "notes": assembly.notes,
        "created_at": assembly.created_at,
        "completed_at": assembly.completed_at,
        "shipped_at": assembly.shipped_at,
        "components": components,
    }


@router.get("/stats/build-capacity")
def get_build_capacity(db: Session = Depends(get_db)):
    """Calculate how many of each configuration can be built with current stock."""
    from app.models import Configuration

    configurations = db.query(Configuration).all()
    result = []

    for config in configurations:
        config_components = (
            db.query(ConfigurationComponent)
            .filter(ConfigurationComponent.configuration_id == config.id)
            .all()
        )

        if not config_components:
            result.append(
                {
                    "configuration_id": config.id,
                    "configuration_name": config.name,
                    "can_build": 0,
                }
            )
            continue

        # Find minimum builds possible based on available stock
        min_builds = float("inf")
        for cc in config_components:
            item = db.query(Item).filter(Item.id == cc.item_id).first()
            if not item or cc.quantity == 0:
                min_builds = 0
                break
            builds_possible = item.quantity_available // cc.quantity
            min_builds = min(min_builds, builds_possible)

        result.append(
            {
                "configuration_id": config.id,
                "configuration_name": config.name,
                "can_build": int(min_builds) if min_builds != float("inf") else 0,
            }
        )

    return result


@router.get("/", response_model=list[AssemblyResponse])
def list_assemblies(status: str | None = None, db: Session = Depends(get_db)):
    """Get all assemblies, optionally filtered by status."""
    query = db.query(Assembly)
    if status:
        query = query.filter(Assembly.status == status)
    assemblies = query.order_by(Assembly.created_at.desc()).all()
    return [get_assembly_with_components(db, a.id) for a in assemblies]


@router.get("/{assembly_id}", response_model=AssemblyResponse)
def get_assembly(assembly_id: int, db: Session = Depends(get_db)):
    """Get a single assembly by ID."""
    result = get_assembly_with_components(db, assembly_id)
    if not result:
        raise HTTPException(status_code=404, detail="Assembly not found")
    return result


@router.post("/", response_model=AssemblyResponse, status_code=201)
def create_assembly(assembly_in: AssemblyCreate, db: Session = Depends(get_db)):
    """Create a new assembly and reserve components."""
    # If configuration provided, load default components
    components_to_reserve: list[AssemblyComponentBase] = list(assembly_in.components)

    if assembly_in.configuration_id and not components_to_reserve:
        config_components = (
            db.query(ConfigurationComponent)
            .filter(
                ConfigurationComponent.configuration_id == assembly_in.configuration_id
            )
            .all()
        )
        for cc in config_components:
            components_to_reserve.append(
                AssemblyComponentBase(item_id=cc.item_id, quantity=cc.quantity)
            )

    # Check availability for all components
    for comp in components_to_reserve:
        item = db.query(Item).filter(Item.id == comp.item_id).first()
        if not item:
            raise HTTPException(
                status_code=400, detail=f"Item {comp.item_id} not found"
            )
        if item.quantity_available < comp.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {item.name}: need {comp.quantity}, have {item.quantity_available}",
            )

    # Create assembly
    assembly = Assembly(
        configuration_id=assembly_in.configuration_id,
        order_reference=assembly_in.order_reference,
        notes=assembly_in.notes,
        status="reserved",
    )
    db.add(assembly)
    db.flush()  # Get assembly ID

    # Reserve components
    for comp in components_to_reserve:
        # Create assembly component
        ac = AssemblyComponent(
            assembly_id=assembly.id,
            item_id=comp.item_id,
            quantity=comp.quantity,
        )
        db.add(ac)

        # Reserve inventory
        item = db.query(Item).filter(Item.id == comp.item_id).first()
        if item:
            item.quantity_reserved += comp.quantity

    db.commit()
    return get_assembly_with_components(db, assembly.id)


@router.patch("/{assembly_id}", response_model=AssemblyResponse)
def update_assembly(
    assembly_id: int, assembly_in: AssemblyUpdate, db: Session = Depends(get_db)
):
    """Update assembly notes or order reference."""
    assembly = db.query(Assembly).filter(Assembly.id == assembly_id).first()
    if not assembly:
        raise HTTPException(status_code=404, detail="Assembly not found")

    if assembly_in.order_reference is not None:
        assembly.order_reference = assembly_in.order_reference
    if assembly_in.notes is not None:
        assembly.notes = assembly_in.notes

    db.commit()
    return get_assembly_with_components(db, assembly.id)


@router.post("/{assembly_id}/start", response_model=AssemblyResponse)
def start_assembly(assembly_id: int, db: Session = Depends(get_db)):
    """Start building an assembly."""
    assembly = db.query(Assembly).filter(Assembly.id == assembly_id).first()
    if not assembly:
        raise HTTPException(status_code=404, detail="Assembly not found")

    if assembly.status != "reserved":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot start assembly with status '{assembly.status}'",
        )

    assembly.status = "building"
    db.commit()
    return get_assembly_with_components(db, assembly.id)


@router.post("/{assembly_id}/complete", response_model=AssemblyResponse)
def complete_assembly(assembly_id: int, db: Session = Depends(get_db)):
    """Complete an assembly - consume reserved components."""
    assembly = db.query(Assembly).filter(Assembly.id == assembly_id).first()
    if not assembly:
        raise HTTPException(status_code=404, detail="Assembly not found")

    if assembly.status not in ("reserved", "building"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot complete assembly with status '{assembly.status}'",
        )

    # Consume components
    for ac in (
        db.query(AssemblyComponent)
        .filter(AssemblyComponent.assembly_id == assembly_id)
        .all()
    ):
        item = db.query(Item).filter(Item.id == ac.item_id).first()
        if item:
            item.quantity_on_hand -= ac.quantity
            item.quantity_reserved -= ac.quantity

    assembly.status = "completed"
    assembly.completed_at = datetime.now(timezone.utc)

    db.commit()
    return get_assembly_with_components(db, assembly.id)


@router.post("/{assembly_id}/ship", response_model=AssemblyResponse)
def ship_assembly(assembly_id: int, db: Session = Depends(get_db)):
    """Mark an assembly as shipped."""
    assembly = db.query(Assembly).filter(Assembly.id == assembly_id).first()
    if not assembly:
        raise HTTPException(status_code=404, detail="Assembly not found")

    if assembly.status != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot ship assembly with status '{assembly.status}'",
        )

    assembly.status = "shipped"
    assembly.shipped_at = datetime.now(timezone.utc)

    db.commit()
    return get_assembly_with_components(db, assembly.id)


@router.post("/{assembly_id}/cancel", response_model=AssemblyResponse)
def cancel_assembly(assembly_id: int, db: Session = Depends(get_db)):
    """Cancel an assembly - release reserved components."""
    assembly = db.query(Assembly).filter(Assembly.id == assembly_id).first()
    if not assembly:
        raise HTTPException(status_code=404, detail="Assembly not found")

    if assembly.status not in ("reserved", "building"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel assembly with status '{assembly.status}'",
        )

    # Release reserved components
    for ac in (
        db.query(AssemblyComponent)
        .filter(AssemblyComponent.assembly_id == assembly_id)
        .all()
    ):
        item = db.query(Item).filter(Item.id == ac.item_id).first()
        if item:
            item.quantity_reserved -= ac.quantity

    assembly.status = "cancelled"

    db.commit()
    return get_assembly_with_components(db, assembly.id)


@router.delete("/{assembly_id}", status_code=204)
def delete_assembly(assembly_id: int, db: Session = Depends(get_db)):
    """Delete a cancelled or completed assembly."""
    assembly = db.query(Assembly).filter(Assembly.id == assembly_id).first()
    if not assembly:
        raise HTTPException(status_code=404, detail="Assembly not found")

    if assembly.status in ("reserved", "building"):
        raise HTTPException(
            status_code=400, detail="Cannot delete active assembly. Cancel it first."
        )

    # Delete assembly components
    db.query(AssemblyComponent).filter(
        AssemblyComponent.assembly_id == assembly_id
    ).delete()

    db.delete(assembly)
    db.commit()
