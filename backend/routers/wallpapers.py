import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from lib.db import db
from models.wallpaper import Wallpaper, WallpaperCreate, WallpaperUpdate

router = APIRouter(prefix="/wallpapers", tags=["wallpapers"])


@router.get("", response_model=List[Wallpaper])
async def list_wallpapers(
    category: Optional[str] = None,
    format: Optional[str] = None,
    resolution: Optional[str] = None,
    favorite_only: Optional[bool] = None,
    search: Optional[str] = None,
):
    query: dict = {}
    if category and category != "all":
        query["category"] = category
    if format and format != "all":
        query["format"] = format
    if resolution and resolution != "all":
        query["resolutions"] = resolution
    if favorite_only:
        query["is_favorite"] = True
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}},
        ]

    docs = await db.wallpapers.find(query).sort("created_at", -1).to_list(1000)
    result = []
    for doc in docs:
        if "created_at" in doc and isinstance(doc["created_at"], datetime):
            doc["created_at"] = doc["created_at"].replace(tzinfo=timezone.utc)
        result.append(Wallpaper(**doc))
    return result


@router.get("/{id}", response_model=Wallpaper)
async def get_wallpaper(id: str):
    doc = await db.wallpapers.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Wallpaper {id} not found")
    if "created_at" in doc and isinstance(doc["created_at"], datetime):
        doc["created_at"] = doc["created_at"].replace(tzinfo=timezone.utc)
    return Wallpaper(**doc)


@router.post("", response_model=Wallpaper, status_code=201)
async def create_wallpaper(payload: WallpaperCreate):
    new_id = str(uuid.uuid4())
    data = payload.model_dump()
    data["id"] = new_id
    data["created_at"] = datetime.now(timezone.utc)
    data["is_favorite"] = False
    data["is_curated"] = False
    
    if not data.get("thumbnail_url"):
        data["thumbnail_url"] = data.get("media_url")

    await db.wallpapers.insert_one(data)
    created = await db.wallpapers.find_one({"id": new_id})
    return Wallpaper(**created)


@router.put("/{id}", response_model=Wallpaper)
async def update_wallpaper(id: str, payload: WallpaperUpdate):
    doc = await db.wallpapers.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Wallpaper {id} not found")

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update_data:
        await db.wallpapers.update_one({"id": id}, {"$set": update_data})

    updated = await db.wallpapers.find_one({"id": id})
    if "created_at" in updated and isinstance(updated["created_at"], datetime):
        updated["created_at"] = updated["created_at"].replace(tzinfo=timezone.utc)
    return Wallpaper(**updated)


@router.delete("/{id}")
async def delete_wallpaper(id: str):
    doc = await db.wallpapers.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Wallpaper {id} not found")

    await db.wallpapers.delete_one({"id": id})
    return {"message": f"Wallpaper {id} deleted successfully", "id": id}


@router.post("/{id}/favorite", response_model=Wallpaper)
async def toggle_favorite(id: str):
    doc = await db.wallpapers.find_one({"id": id})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Wallpaper {id} not found")

    new_fav = not doc.get("is_favorite", False)
    await db.wallpapers.update_one({"id": id}, {"$set": {"is_favorite": new_fav}})
    updated = await db.wallpapers.find_one({"id": id})
    if "created_at" in updated and isinstance(updated["created_at"], datetime):
        updated["created_at"] = updated["created_at"].replace(tzinfo=timezone.utc)
    return Wallpaper(**updated)
