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
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("letter-ai")

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
    logger.info(f"Received processing request for letter {req.letterId} with {len(req.pages)} pages")
    asyncio.create_task(_process_and_callback(req))
    return {"status": "processing", "letterId": req.letterId}


async def _process_and_callback(req: ProcessRequest):
    results = []
    success = True
    error_msg = None
    
    try:
        for page in req.pages:
            logger.info(f"Processing page {page.id} for letter {req.letterId}")
            img = download_image(page.imageUrl)
            validation = validate_scan(img)
            
            if not validation["valid"]:
                logger.warning(f"Validation failed for page {page.id}: {validation['issues']}")
                success = False
                error_msg = f"Validation failed: {', '.join(validation['issues'])}"
                break
                
            reveal_map_bytes = generate_reveal_map(img)
            logger.info(f"Generated reveal map for page {page.id}, uploading...")
            
            reveal_map_url = upload_reveal_map(
                reveal_map_bytes, f"{req.letterId}-{page.id}"
            )
            results.append({"id": page.id, "revealMapUrl": reveal_map_url})
            logger.info(f"Uploaded reveal map for page {page.id}: {reveal_map_url}")
            
    except Exception as e:
        logger.error(f"Processing failed for letter {req.letterId}: {str(e)}", exc_info=True)
        success = False
        error_msg = str(e)

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            logger.info(f"Sending callback to {req.callbackUrl} (success={success})")
            payload = {
                "letterId": req.letterId,
                "pages": results,
                "success": success,
            }
            if error_msg:
                payload["error"] = error_msg
                
            resp = await client.post(req.callbackUrl, json=payload)
            logger.info(f"Callback response: {resp.status_code}")
    except Exception as e:
        logger.error(f"Callback failed for letter {req.letterId}: {str(e)}")


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
