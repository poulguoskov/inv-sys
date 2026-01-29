from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Assembly, AssemblyComponent, Item, ConfigurationComponent
from app.schemas.assembly import (
    AssemblyCreate,
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
        "notes": assembly.notes,
        "created_at": assembly.created_at,
        "completed_at": assembly.completed_at,
        "components": components,
    }


@router.get("/", response_model=list[AssemblyResponse])
def list_assemblies(db: Session = Depends(get_db)):
    """Get all assemblies."""
    assemblies = db.query(Assembly).all()
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


@router.post("/{assembly_id}/complete", response_model=AssemblyResponse)
def complete_assembly(assembly_id: int, db: Session = Depends(get_db)):
    """Complete an assembly - consume reserved components."""
    assembly = db.query(Assembly).filter(Assembly.id == assembly_id).first()
    if not assembly:
        raise HTTPException(status_code=404, detail="Assembly not found")

    if assembly.status != "reserved":
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


@router.post("/{assembly_id}/cancel", response_model=AssemblyResponse)
def cancel_assembly(assembly_id: int, db: Session = Depends(get_db)):
    """Cancel an assembly - release reserved components."""
    assembly = db.query(Assembly).filter(Assembly.id == assembly_id).first()
    if not assembly:
        raise HTTPException(status_code=404, detail="Assembly not found")

    if assembly.status != "reserved":
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

    if assembly.status == "reserved":
        raise HTTPException(
            status_code=400, detail="Cannot delete reserved assembly. Cancel it first."
        )

    # Delete assembly components
    db.query(AssemblyComponent).filter(
        AssemblyComponent.assembly_id == assembly_id
    ).delete()

    db.delete(assembly)
    db.commit()
