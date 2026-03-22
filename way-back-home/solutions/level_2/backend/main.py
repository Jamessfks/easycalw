from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Survivor Network API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}


from api.routes import graph, chat, upload
app.include_router(graph.router)
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])

