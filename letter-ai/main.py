import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
from services.image_processor import (
    download_image,
    generate_reveal_map,
    validate_scan,
)
from services.cloudinary_client import upload_reveal_map

load_dotenv()
app = FastAPI(title="Letter AI Processor")


class PageInput(BaseModel):
    id: str
    imageUrl: str


class ProcessRequest(BaseModel):
    letterId: str
    pages: list[PageInput]
    callbackUrl: str


class ValidateRequest(BaseModel):
    imageUrl: str


@app.post("/process")
async def process_letter(req: ProcessRequest):
    """Process letter pages in background, callback when done."""
    asyncio.create_task(_process_and_callback(req))
    return {"status": "processing", "letterId": req.letterId}


async def _process_and_callback(req: ProcessRequest):
    results = []
    success = True
    try:
        for page in req.pages:
            img = download_image(page.imageUrl)
            validation = validate_scan(img)
            if not validation["valid"]:
                success = False
                break
            reveal_map_bytes = generate_reveal_map(img)
            reveal_map_url = upload_reveal_map(
                reveal_map_bytes, f"{req.letterId}-{page.id}"
            )
            results.append({"id": page.id, "revealMapUrl": reveal_map_url})
    except Exception as e:
        print(f"Processing failed for letter {req.letterId}: {e}")
        success = False

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            await client.post(
                req.callbackUrl,
                json={
                    "letterId": req.letterId,
                    "pages": results,
                    "success": success,
                },
            )
    except Exception as e:
        print(f"Callback failed: {e}")


@app.post("/validate")
async def validate_image(req: ValidateRequest):
    """Quick validation check for a scan before creating the letter."""
    try:
        img = download_image(req.imageUrl)
        return validate_scan(img)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok"}
