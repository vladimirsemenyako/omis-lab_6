from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import devices, commands, settings, users, voice

app = FastAPI(
    title="Voice Assistant API",
    description="API для интеллектуальной системы распознавания речи",
    version="1.0.0",
    redirect_slashes=False
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(devices.router, prefix="/api/devices", tags=["devices"])
app.include_router(commands.router, prefix="/api/commands", tags=["commands"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])


@app.get("/")
async def root():
    return {"message": "Voice Assistant API is running"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
