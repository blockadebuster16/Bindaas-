"""
Cases CRUD — POST/GET/PUT/DELETE /api/cases
Business owners define resolution policies here.
"""
from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from bson import ObjectId
from .owners import get_current_owner

router = APIRouter()


class CaseCreate(BaseModel):
    intent: str
    anger_bucket: str                  # CALM | FRUSTRATED | ANGRY
    response_template: str
    compensation_type: str             # none | discount | store_credit | refund | priority_support
    compensation_value: Optional[str] = ""


class CaseUpdate(BaseModel):
    intent: Optional[str] = None
    anger_bucket: Optional[str] = None
    response_template: Optional[str] = None
    compensation_type: Optional[str] = None
    compensation_value: Optional[str] = None


def _serialize(doc) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.post("/cases")
async def create_case(body: CaseCreate, request: Request, owner=Depends(get_current_owner)):
    db = request.app.state.db
    doc = {**body.model_dump(), "owner_id": owner["id"]}
    result = await db["cases"].insert_one(doc)
    return {"id": str(result.inserted_id), **doc}


@router.get("/cases")
async def list_cases(request: Request, owner=Depends(get_current_owner)):
    db = request.app.state.db
    cursor = db["cases"].find({"owner_id": owner["id"]})
    cases = [_serialize(doc) async for doc in cursor]
    return cases


@router.put("/cases/{case_id}")
async def update_case(case_id: str, body: CaseUpdate, request: Request, owner=Depends(get_current_owner)):
    db = request.app.state.db
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    result = await db["cases"].update_one(
        {"_id": ObjectId(case_id), "owner_id": owner["id"]},
        {"$set": updates},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"updated": True}


@router.delete("/cases/{case_id}")
async def delete_case(case_id: str, request: Request, owner=Depends(get_current_owner)):
    db = request.app.state.db
    result = await db["cases"].delete_one(
        {"_id": ObjectId(case_id), "owner_id": owner["id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Case not found")
    return {"deleted": True}
