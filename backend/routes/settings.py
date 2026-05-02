from typing import Annotated

import validators
from fastapi import APIRouter, HTTPException, Depends

import dependencies.app
import dependencies.globals
from dependencies import raven_db
from dependencies.models import Settings
from routes.auth import User, get_current_active_user

router = APIRouter()

@router.get("/")
async def get_settings(current_user: Annotated[User, Depends(get_current_active_user)]) -> Settings:
    from_db = await raven_db.get_create_app_settings()
    return from_db

@router.post("/")
async def update_settings(settings: Settings, current_user: Annotated[User, Depends(get_current_active_user)]):
    await raven_db.save_settings(settings)

    dependencies.globals.settings = settings
    await dependencies.app.update_get_data_cron()

    return "ok"


############################ Separate endpoints for changing station URLs ############################

@router.post("/dht22_indoor_address/")
async def set_dht22_indoor_address(address: str, current_user: Annotated[User, Depends(get_current_active_user)]):
    if not validators.url(address):
        raise HTTPException(
            status_code=400,
            detail="Invalid URL",
        )

    settings = await raven_db.get_create_app_settings()
    settings.dht22_indoor_address = address
    await raven_db.save_settings(settings)

    return "ok"

@router.post("/dht22_outdoor_address/")
async def set_dht22_outdoor_address(address: str, current_user: Annotated[User, Depends(get_current_active_user)]):
    if not validators.url(address):
        raise HTTPException(
            status_code=400,
            detail="Invalid URL",
        )

    settings = await raven_db.get_create_app_settings()
    settings.dht22_outdoor_address = address
    await raven_db.save_settings(settings)

    return "ok"
