# Handwritten Letter Sharing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a system to upload scanned handwritten letter images, generate shareable links (public or password-protected), and display them with an envelope-opening animation and a writing stroke reveal effect.

**Architecture:** New `letter` NestJS module in the backend with Prisma model for letter metadata. Cloudinary stores scanned images. A separate Python/FastAPI microservice (`letter-ai`) uses OpenCV to process scanned images and generate **reveal timing maps** — grayscale images where pixel brightness = reveal order. Processing is async: upload → `status: processing` → microservice generates reveal map → `status: ready`. Frontend has an admin CRUD page and a public viewer page at `/letter/[code]` with envelope animation + canvas-based writing reveal using the timing map. Letters support 1-3 pages.

**Tech Stack:** NestJS, Prisma (SQL Server), Cloudinary, Next.js (Pages Router), Tailwind CSS, Framer Motion, bcrypt | Python, FastAPI, OpenCV, NumPy, Cloudinary SDK

---

## File Structure

### Backend (`be/`)
| File | Responsibility |
|---|---|
| `prisma/schema.prisma` | Add `Letter` and `LetterPage` models |
| `src/letter/letter.module.ts` | NestJS module registration |
| `src/letter/letter.controller.ts` | REST endpoints (CRUD + public resolve) |
| `src/letter/letter.service.ts` | Business logic, code generation, password verification |
| `src/letter/dto/create-letter.dto.ts` | Validation for create |
| `src/letter/dto/update-letter.dto.ts` | Validation for update |
| `src/app.module.ts` | Register LetterModule |

### Python Microservice (`letter-ai/`)
| File | Responsibility |
|---|---|
| `main.py` | FastAPI app with `/process` endpoint |
| `services/image_processor.py` | OpenCV: binarize → connected components → reveal map |
| `services/cloudinary_client.py` | Upload reveal map PNG to Cloudinary |
| `requirements.txt` | Dependencies: fastapi, uvicorn, opencv-python-headless, numpy, cloudinary, httpx |
| `Dockerfile` | Python 3.11 slim container |

### Frontend (`fe/`)
| File | Responsibility |
|---|---|
| `pages/admin/letters.jsx` | Admin CRUD dashboard page |
| `pages/letter/[code].jsx` | Public letter viewer with animations |
| `components/letter/EnvelopeAnimation.jsx` | Envelope open + letter pull-out animation |
| `components/letter/WritingReveal.jsx` | Canvas-based reveal using timing map from microservice |
| `components/letter/PasswordGate.jsx` | Password input form for protected letters |

### Docker
| File | Responsibility |
|---|---|
| `docker-compose.yml` | Add `letter-ai` service |
| `docker-compose.prod.yml` | Add `letter-ai` service for production |

---

### Task 1: Prisma Schema — Letter and LetterPage Models

**Files:**
- Modify: `be/prisma/schema.prisma`

- [ ] **Step 1: Add Letter and LetterPage models to schema**

Append to the end of `be/prisma/schema.prisma`:

```prisma
model Letter {
  id          String       @id @default(uuid())
  code        String       @unique
  title       String?
  password    String?      // bcrypt hash, null = public
  status      String       @default("processing") // processing, ready, failed
  isActive    Boolean      @default(true)
  views       Int          @default(0)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  pages       LetterPage[]

  @@index([code])
  @@index([isActive])
  @@index([status])
  @@map("letters")
}

model LetterPage {
  id           String   @id @default(uuid())
  letterId     String
  imageUrl     String   @db.NVarChar(2048)
  revealMapUrl String?  @db.NVarChar(2048) // grayscale timing map from OpenCV
  width        Int?
  height       Int?
  sortOrder    Int      @default(0)
  createdAt    DateTime @default(now())

  letter Letter @relation(fields: [letterId], references: [id], onDelete: Cascade)

  @@index([letterId])
  @@map("letter_pages")
}
```

- [ ] **Step 2: Run Prisma migration**

```bash
cd be && npx prisma migrate dev --name add-letter-models
```

Expected: Migration created successfully.

- [ ] **Step 3: Generate Prisma client**

```bash
cd be && npx prisma generate
```

- [ ] **Step 4: Commit**

```bash
git add be/prisma/
git commit -m "feat(letter): add Letter and LetterPage prisma models"
```

---

### Task 2: Backend — Letter DTOs

**Files:**
- Create: `be/src/letter/dto/create-letter.dto.ts`
- Create: `be/src/letter/dto/update-letter.dto.ts`

- [ ] **Step 1: Create CreateLetterDto**

```typescript
// be/src/letter/dto/create-letter.dto.ts
import {
  IsString, IsOptional, IsBoolean, IsArray,
  ArrayMinSize, ArrayMaxSize, MaxLength, Matches,
  ValidateNested, IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LetterPageDto {
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateLetterDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Code can only contain letters, numbers, hyphens, and underscores',
  })
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => LetterPageDto)
  pages: LetterPageDto[];
}
```

- [ ] **Step 2: Create UpdateLetterDto**

```typescript
// be/src/letter/dto/update-letter.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateLetterDto } from './create-letter.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateLetterDto extends PartialType(CreateLetterDto) {
  @IsOptional()
  @IsBoolean()
  removePassword?: boolean;
}
```

- [ ] **Step 3: Commit**

```bash
git add be/src/letter/dto/
git commit -m "feat(letter): add create and update DTOs"
```

---

### Task 3: Backend — Letter Service

**Files:**
- Create: `be/src/letter/letter.service.ts`

- [ ] **Step 1: Install bcrypt**

```bash
cd be && npm install bcrypt && npm install -D @types/bcrypt
```

- [ ] **Step 2: Create LetterService**

```typescript
// be/src/letter/letter.service.ts
import {
  Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LetterService {
  constructor(private prisma: PrismaService) {}

  private generateCode(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async create(dto: CreateLetterDto) {
    let code = dto.code;
    if (!code) {
      let attempts = 0;
      do {
        code = this.generateCode();
        const existing = await this.prisma.letter.findUnique({ where: { code } });
        if (!existing) break;
        attempts++;
      } while (attempts < 10);
      if (attempts >= 10) throw new ConflictException('Failed to generate unique code.');
    } else {
      const existing = await this.prisma.letter.findUnique({ where: { code } });
      if (existing) throw new ConflictException('This code is already in use');
    }

    let hashedPassword: string | null = null;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    const letter = await this.prisma.letter.create({
      data: {
        code,
        title: dto.title,
        password: hashedPassword,
        status: 'processing',
        isActive: dto.isActive ?? true,
        pages: {
          create: dto.pages.map((p, i) => ({
            imageUrl: p.imageUrl,
            width: p.width,
            height: p.height,
            sortOrder: p.sortOrder ?? i,
          })),
        },
      },
      include: { pages: { orderBy: { sortOrder: 'asc' } } },
    });

    // Fire-and-forget: trigger async processing via Python microservice
    this.triggerProcessing(letter.id, letter.pages).catch((err) =>
      console.error('Letter processing trigger failed:', err),
    );

    return letter;
  }

  private async triggerProcessing(letterId: string, pages: any[]) {
    const axios = require('axios');
    const aiUrl = process.env.LETTER_AI_URL || 'http://letter-ai:8000';
    try {
      await axios.post(`${aiUrl}/process`, {
        letterId,
        pages: pages.map((p) => ({ id: p.id, imageUrl: p.imageUrl })),
        callbackUrl: `${process.env.SELF_URL || 'http://backend:3001'}/letters/processing-callback`,
      });
    } catch (err) {
      await this.prisma.letter.update({
        where: { id: letterId },
        data: { status: 'failed' },
      });
    }
  }

  async handleProcessingCallback(data: { letterId: string; pages: { id: string; revealMapUrl: string }[]; success: boolean }) {
    if (!data.success) {
      await this.prisma.letter.update({ where: { id: data.letterId }, data: { status: 'failed' } });
      return;
    }
    for (const page of data.pages) {
      await this.prisma.letterPage.update({
        where: { id: page.id },
        data: { revealMapUrl: page.revealMapUrl },
      });
    }
    await this.prisma.letter.update({ where: { id: data.letterId }, data: { status: 'ready' } });
  }

  async findAll() {
    return this.prisma.letter.findMany({
      orderBy: { createdAt: 'desc' },
      include: { pages: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async resolve(code: string) {
    const letter = await this.prisma.letter.findUnique({
      where: { code },
      include: { pages: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!letter) throw new NotFoundException('Letter not found');
    if (!letter.isActive) throw new NotFoundException('This letter is no longer available');
    if (letter.status === 'processing') throw new NotFoundException('Letter is still being processed');
    if (letter.status === 'failed') throw new NotFoundException('Letter processing failed');

    this.prisma.letter
      .update({ where: { id: letter.id }, data: { views: { increment: 1 } } })
      .catch(() => {});

    return {
      id: letter.id,
      title: letter.title,
      hasPassword: !!letter.password,
      pages: letter.password ? [] : letter.pages,
      createdAt: letter.createdAt,
    };
  }

  async verifyPassword(code: string, password: string) {
    const letter = await this.prisma.letter.findUnique({
      where: { code },
      include: { pages: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!letter) throw new NotFoundException('Letter not found');
    if (!letter.isActive) throw new NotFoundException('This letter is no longer available');
    if (!letter.password) return { pages: letter.pages, title: letter.title };

    const isValid = await bcrypt.compare(password, letter.password);
    if (!isValid) throw new ForbiddenException('Incorrect password');
    return { pages: letter.pages, title: letter.title };
  }

  async update(id: string, dto: UpdateLetterDto) {
    const existing = await this.prisma.letter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Letter not found');

    if (dto.code && dto.code !== existing.code) {
      const codeInUse = await this.prisma.letter.findUnique({ where: { code: dto.code } });
      if (codeInUse) throw new ConflictException('This code is already in use');
    }

    const data: any = {};
    if (dto.code) data.code = dto.code;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.removePassword) {
      data.password = null;
    } else if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.pages) {
      await this.prisma.letterPage.deleteMany({ where: { letterId: id } });
      data.pages = {
        create: dto.pages.map((p, i) => ({
          imageUrl: p.imageUrl, width: p.width, height: p.height,
          sortOrder: p.sortOrder ?? i,
        })),
      };
    }

    return this.prisma.letter.update({
      where: { id }, data,
      include: { pages: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.letter.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Letter not found');
    return this.prisma.letter.delete({ where: { id } });
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.letter.deleteMany({ where: { id: { in: ids } } });
    return { deleted: result.count };
  }

  async bulkUpdateStatus(ids: string[], isActive: boolean) {
    const result = await this.prisma.letter.updateMany({
      where: { id: { in: ids } }, data: { isActive },
    });
    return { updated: result.count };
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add be/src/letter/
git commit -m "feat(letter): add letter service with CRUD and password verification"
```

---

### Task 4: Backend — Controller + Module + App Registration

**Files:**
- Create: `be/src/letter/letter.controller.ts`
- Create: `be/src/letter/letter.module.ts`
- Modify: `be/src/app.module.ts`

- [ ] **Step 1: Create LetterController**

```typescript
// be/src/letter/letter.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
} from '@nestjs/common';
import { LetterService } from './letter.service';
import { CreateLetterDto } from './dto/create-letter.dto';
import { UpdateLetterDto } from './dto/update-letter.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('letters')
export class LetterController {
  constructor(private readonly letterService: LetterService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateLetterDto) {
    return this.letterService.create(dto);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() { return this.letterService.findAll(); }

  @Get('resolve/:code')
  resolve(@Param('code') code: string) {
    return this.letterService.resolve(code);
  }

  @Post('verify/:code')
  verifyPassword(@Param('code') code: string, @Body() body: { password: string }) {
    return this.letterService.verifyPassword(code, body.password);
  }

  @Post('processing-callback')
  processingCallback(@Body() body: { letterId: string; pages: { id: string; revealMapUrl: string }[]; success: boolean }) {
    return this.letterService.handleProcessingCallback(body);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateLetterDto) {
    return this.letterService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) { return this.letterService.remove(id); }

  @Post('bulk/delete')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  bulkDelete(@Body() body: { ids: string[] }) {
    return this.letterService.bulkDelete(body.ids);
  }

  @Post('bulk/status')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  bulkUpdateStatus(@Body() body: { ids: string[]; isActive: boolean }) {
    return this.letterService.bulkUpdateStatus(body.ids, body.isActive);
  }
}
```

- [ ] **Step 2: Create LetterModule**

```typescript
// be/src/letter/letter.module.ts
import { Module } from '@nestjs/common';
import { LetterController } from './letter.controller';
import { LetterService } from './letter.service';

@Module({
  controllers: [LetterController],
  providers: [LetterService],
  exports: [LetterService],
})
export class LetterModule {}
```

- [ ] **Step 3: Register in AppModule**

In `be/src/app.module.ts`, add:
```typescript
import { LetterModule } from './letter/letter.module';
```
Add `LetterModule` to the `imports` array.

- [ ] **Step 4: Verify build**

```bash
cd be && npx nest build
```

- [ ] **Step 5: Commit**

```bash
git add be/src/letter/ be/src/app.module.ts
git commit -m "feat(letter): add controller, module, register in app"
```

---

### Task 5: Python Microservice — letter-ai Setup

**Files:**
- Create: `letter-ai/requirements.txt`
- Create: `letter-ai/Dockerfile`
- Create: `letter-ai/services/cloudinary_client.py`
- Create: `letter-ai/services/image_processor.py`
- Create: `letter-ai/main.py`
- Create: `letter-ai/.env.example`

- [ ] **Step 1: Create requirements.txt**

```txt
# letter-ai/requirements.txt
fastapi==0.115.0
uvicorn[standard]==0.32.0
opencv-python-headless==4.10.0.84
numpy==2.1.0
cloudinary==1.41.0
httpx==0.28.0
python-dotenv==1.0.1
```

- [ ] **Step 2: Create Dockerfile**

```dockerfile
# letter-ai/Dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 3: Create cloudinary_client.py**

```python
# letter-ai/services/cloudinary_client.py
import cloudinary
import cloudinary.uploader
import os

def configure():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    )

def upload_reveal_map(image_bytes: bytes, public_id: str) -> str:
    """Upload grayscale reveal map PNG to Cloudinary. Returns the URL."""
    configure()
    result = cloudinary.uploader.upload(
        image_bytes,
        public_id=f"letters/reveal-maps/{public_id}",
        resource_type="image",
        format="png",
        overwrite=True,
    )
    return result["secure_url"]
```

- [ ] **Step 4: Create image_processor.py**

```python
# letter-ai/services/image_processor.py
import cv2
import numpy as np
import httpx

def download_image(url: str) -> np.ndarray:
    """Download image from URL and decode to OpenCV format."""
    resp = httpx.get(url, timeout=30)
    resp.raise_for_status()
    arr = np.frombuffer(resp.content, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Failed to decode image")
    return img

def generate_reveal_map(img: np.ndarray) -> bytes:
    """
    Process scanned handwriting image to generate a reveal timing map.
    Returns PNG bytes of a grayscale image where:
    - pixel value 0 = revealed first (top-left text)
    - pixel value 255 = revealed last (bottom-right text)
    - background pixels = 0 (revealed immediately as paper)
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    # Adaptive threshold to separate ink from paper (handles white/brown paper)
    binary = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV, blockSize=31, C=15
    )

    # Morphological cleanup: remove noise, connect nearby strokes
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=1)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=1)

    # Connected component analysis
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary)

    # Collect components (skip background label 0)
    components = []
    for i in range(1, num_labels):
        x, y, cw, ch, area = stats[i]
        if area < 20:  # skip tiny noise
            continue
        cx, cy = centroids[i]
        components.append({"id": i, "cx": cx, "cy": cy, "area": area})

    if not components:
        # No text detected — return uniform map
        reveal_map = np.zeros((h, w), dtype=np.uint8)
        _, buf = cv2.imencode(".png", reveal_map)
        return buf.tobytes()

    # Group into text lines by clustering Y coordinates
    components.sort(key=lambda c: c["cy"])
    line_height = h * 0.04  # ~4% of image height as line threshold
    lines = []
    current_line = [components[0]]

    for comp in components[1:]:
        if abs(comp["cy"] - current_line[-1]["cy"]) < line_height:
            current_line.append(comp)
        else:
            lines.append(sorted(current_line, key=lambda c: c["cx"]))
            current_line = [comp]
    lines.append(sorted(current_line, key=lambda c: c["cx"]))

    # Assign reveal timing (0-255) based on reading order
    total = sum(len(line) for line in lines)
    reveal_map = np.zeros((h, w), dtype=np.uint8)
    idx = 0

    for line in lines:
        for comp in line:
            timing = int((idx / max(total - 1, 1)) * 255)
            reveal_map[labels == comp["id"]] = timing
            idx += 1

    # Dilate to include stroke edges and slight surrounding area
    dilate_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    reveal_map = cv2.dilate(reveal_map, dilate_kernel, iterations=2)

    # Smooth transitions with Gaussian blur
    reveal_map = cv2.GaussianBlur(reveal_map, (11, 11), 0)

    _, buf = cv2.imencode(".png", reveal_map)
    return buf.tobytes()

def validate_scan(img: np.ndarray) -> dict:
    """Validate that the scanned image is suitable for processing."""
    h, w = img.shape[:2]
    issues = []

    if h < 500 or w < 300:
        issues.append("Image resolution too low (min 300x500)")
    if w > h:
        issues.append("Image appears to be landscape; expected portrait")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    contrast = gray.std()
    if contrast < 30:
        issues.append(f"Low contrast ({contrast:.0f}); text may be hard to detect")

    return {"valid": len(issues) == 0, "issues": issues, "width": w, "height": h}
```

- [ ] **Step 5: Create main.py (FastAPI app)**

```python
# letter-ai/main.py
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
from services.image_processor import download_image, generate_reveal_map, validate_scan
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
            reveal_map_url = upload_reveal_map(reveal_map_bytes, f"{req.letterId}-{page.id}")
            results.append({"id": page.id, "revealMapUrl": reveal_map_url})
    except Exception as e:
        print(f"Processing failed for letter {req.letterId}: {e}")
        success = False

    # Callback to NestJS backend
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(req.callbackUrl, json={
                "letterId": req.letterId,
                "pages": results,
                "success": success,
            })
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
```

- [ ] **Step 6: Create .env.example**

```env
# letter-ai/.env.example
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

- [ ] **Step 7: Commit**

```bash
git add letter-ai/
git commit -m "feat(letter-ai): add Python microservice for handwriting reveal map generation"
```

---

### Task 6: Docker Compose — Add letter-ai Service

**Files:**
- Modify: `docker-compose.yml`
- Modify: `docker-compose.prod.yml`

- [ ] **Step 1: Add letter-ai to docker-compose.yml**

Add after the `frontend` service block (before `caddy`):

```yaml
  # nosemgrep: yaml.docker-compose.security.writable-filesystem-service.writable-filesystem-service
  letter-ai:
    build:
      context: ./letter-ai
      dockerfile: Dockerfile
    container_name: yunkhngn_letter_ai
    env_file:
      - ./letter-ai/.env
    ports:
      - "8000:8000"
    networks:
      - app_network
    security_opt:
      - no-new-privileges:true
```

- [ ] **Step 2: Add LETTER_AI_URL to backend environment in docker-compose.yml**

Add to the `backend` service `environment` section:

```yaml
      - LETTER_AI_URL=http://letter-ai:8000
```

- [ ] **Step 3: Add letter-ai to docker-compose.prod.yml**

Add after the `frontend` service block:

```yaml
  letter-ai:
    image: ${LETTER_AI_IMAGE:-ghcr.io/yunkhngn/yunkhngn-letter-ai:latest}
    container_name: yunkhngn-letter-ai
    restart: always
    env_file:
      - ./letter-ai/.env
    networks:
      - app-network
    security_opt:
      - no-new-privileges:true
```

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yml docker-compose.prod.yml
git commit -m "feat(letter-ai): add letter-ai service to docker compose"
```

---

### Task 7: Frontend — PasswordGate Component

**Files:**
- Create: `fe/components/letter/PasswordGate.jsx`

- [ ] **Step 1: Create PasswordGate**

```jsx
// fe/components/letter/PasswordGate.jsx
import { useState } from 'react';
import { Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PasswordGate({ code, onVerified }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/letters/verify/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onVerified(await res.json());
      } else {
        setError('Mật khẩu không đúng');
      }
    } catch {
      setError('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-900/20 border border-amber-800/30 flex items-center justify-center">
          <Lock className="w-7 h-7 text-amber-600/80" />
        </div>
        <div>
          <h2 className="text-xl font-serif text-amber-100/90 mb-1">Bức thư được bảo vệ</h2>
          <p className="text-sm text-amber-100/40">Nhập mật khẩu để đọc thư</p>
        </div>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            className="w-full bg-[#2a2218] border border-amber-900/30 rounded-lg px-4 py-3 pr-20 text-amber-100/90 placeholder:text-amber-100/20 focus:outline-none focus:border-amber-700/50 font-mono text-sm"
            autoFocus
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button type="button" onClick={() => setShow(!show)} className="p-1.5 text-amber-100/30 hover:text-amber-100/60">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button type="submit" disabled={loading || !password.trim()} className="p-1.5 text-amber-600 hover:text-amber-500 disabled:opacity-30">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && <p className="text-red-400/80 text-sm">{error}</p>}
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add fe/components/letter/
git commit -m "feat(letter): add PasswordGate component"
```

---

### Task 8: Frontend — EnvelopeAnimation Component

**Files:**
- Create: `fe/components/letter/EnvelopeAnimation.jsx`

- [ ] **Step 1: Create EnvelopeAnimation**

Uses Framer Motion. Phases: closed → opening (flap rotates) → pulling (letter slides up) → done (fades out). Warm sepia palette. Calls `onComplete()` when finished.

```jsx
// fe/components/letter/EnvelopeAnimation.jsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function EnvelopeAnimation({ onComplete }) {
  const [phase, setPhase] = useState('closed');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('opening'), 800);
    const t2 = setTimeout(() => setPhase('pulling'), 1800);
    const t3 = setTimeout(() => setPhase('done'), 3200);
    const t4 = setTimeout(() => onComplete(), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#1a1410] flex items-center justify-center z-50">
      <motion.div className="relative w-72 h-48 sm:w-96 sm:h-64"
        animate={phase === 'done' ? { opacity: 0, scale: 0.8 } : {}}
        transition={{ duration: 0.5 }}>
        <div className="absolute inset-0 bg-[#c4a87c] rounded-lg shadow-2xl" />
        <motion.div className="absolute left-4 right-4 bg-[#f5f0e8] rounded-t-sm shadow-md z-10"
          style={{ bottom: '50%', height: '80%' }}
          initial={{ y: 60 }}
          animate={phase === 'pulling' || phase === 'done' ? { y: -120 } : phase === 'opening' ? { y: 30 } : { y: 60 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
          <div className="p-4 space-y-2 pt-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-1 bg-[#d4cfc5] rounded" style={{ width: `${70 + Math.random() * 25}%` }} />
            ))}
          </div>
        </motion.div>
        <div className="absolute inset-0 bg-[#d4a860] rounded-lg z-20 overflow-hidden"
          style={{ clipPath: 'polygon(0 40%, 50% 70%, 100% 40%, 100% 100%, 0 100%)' }} />
        <motion.div className="absolute top-0 left-0 right-0 h-1/2 bg-[#c4a050] z-30 origin-top"
          style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}
          initial={{ rotateX: 0 }}
          animate={phase !== 'closed' ? { rotateX: 180 } : { rotateX: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }} />
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#8b2500] shadow-lg z-40 flex items-center justify-center"
          animate={phase !== 'closed' ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}>
          <span className="text-amber-200/60 text-xs font-serif">✦</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add fe/components/letter/EnvelopeAnimation.jsx
git commit -m "feat(letter): add envelope opening animation"
```

---

### Task 9: Frontend — WritingReveal Component (Canvas + Reveal Map)

**Files:**
- Create: `fe/components/letter/WritingReveal.jsx`

- [ ] **Step 1: Create WritingReveal**

Uses `<canvas>` to render a pixel-by-pixel reveal animation driven by the reveal timing map from the Python microservice. Loads both the letter image and the grayscale reveal map. On each animation frame, compares each pixel's reveal map value against a threshold that increases over ~8 seconds. Background pixels (value 0 in the map) show as paper color immediately.

```jsx
// fe/components/letter/WritingReveal.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

function RevealCanvas({ imageUrl, revealMapUrl, duration = 8000 }) {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const letterImg = new Image();
    const mapImg = new Image();
    letterImg.crossOrigin = 'anonymous';
    mapImg.crossOrigin = 'anonymous';

    let animId;
    let letterData, mapData;

    const startAnimation = () => {
      canvas.width = letterImg.width;
      canvas.height = letterImg.height;

      // Get pixel data for both images
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      tempCanvas.width = letterImg.width;
      tempCanvas.height = letterImg.height;
      tempCtx.drawImage(letterImg, 0, 0);
      letterData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

      tempCtx.clearRect(0, 0, canvas.width, canvas.height);
      tempCtx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);
      mapData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

      setLoaded(true);
      const startTime = performance.now();

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const threshold = progress * 255;

        const output = ctx.createImageData(canvas.width, canvas.height);
        const paper = [245, 240, 232]; // #f5f0e8

        for (let i = 0; i < output.data.length; i += 4) {
          const revealVal = mapData.data[i]; // R channel = timing
          if (revealVal === 0 || revealVal <= threshold) {
            // Show letter pixel
            output.data[i] = letterData.data[i];
            output.data[i + 1] = letterData.data[i + 1];
            output.data[i + 2] = letterData.data[i + 2];
            output.data[i + 3] = 255;
          } else {
            // Show paper
            output.data[i] = paper[0];
            output.data[i + 1] = paper[1];
            output.data[i + 2] = paper[2];
            output.data[i + 3] = 255;
          }
        }
        ctx.putImageData(output, 0, 0);
        if (progress < 1) animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
    };

    let loadCount = 0;
    const onLoad = () => { loadCount++; if (loadCount === 2) startAnimation(); };
    letterImg.onload = onLoad;
    mapImg.onload = onLoad;
    letterImg.src = imageUrl;
    mapImg.src = revealMapUrl;

    return () => { if (animId) cancelAnimationFrame(animId); };
  }, [imageUrl, revealMapUrl, duration]);

  return (
    <div className="relative w-full max-w-lg bg-[#f5f0e8] rounded-sm shadow-2xl overflow-hidden"
      style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.5), inset 0 0 80px rgba(139,109,71,0.08)' }}>
      <canvas ref={canvasRef} className="w-full h-auto block" style={{ opacity: loaded ? 1 : 0 }} />
      {!loaded && (
        <div className="aspect-[3/4] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-amber-600/40 border-t-amber-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export default function WritingReveal({ pages }) {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="min-h-screen bg-[#1a1410] flex flex-col items-center py-8 px-4">
      {pages.length > 1 && (
        <div className="flex gap-2 mb-6">
          {pages.map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i)}
              className={`w-8 h-8 rounded-full text-xs font-serif border transition-all ${
                i === currentPage
                  ? 'bg-amber-800/60 border-amber-600/50 text-amber-100'
                  : 'bg-transparent border-amber-900/30 text-amber-100/40 hover:border-amber-700/40'
              }`}>{i + 1}</button>
          ))}
        </div>
      )}
      <motion.div key={currentPage}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        {pages[currentPage].revealMapUrl ? (
          <RevealCanvas
            imageUrl={pages[currentPage].imageUrl}
            revealMapUrl={pages[currentPage].revealMapUrl}
          />
        ) : (
          /* Fallback: show image directly if no reveal map */
          <div className="relative w-full max-w-lg bg-[#f5f0e8] rounded-sm shadow-2xl overflow-hidden">
            <img src={pages[currentPage].imageUrl} alt={`Page ${currentPage + 1}`}
              className="w-full h-auto block" />
          </div>
        )}
      </motion.div>
      {pages.length > 1 && (
        <p className="mt-4 text-amber-100/30 text-xs font-serif">
          Trang {currentPage + 1} / {pages.length}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add fe/components/letter/WritingReveal.jsx
git commit -m "feat(letter): add canvas-based writing reveal with reveal map"
```

---

### Task 10: Frontend — Public Letter Viewer Page

**Files:**
- Create: `fe/pages/letter/[code].jsx`

- [ ] **Step 1: Create the public letter page**

```jsx
// fe/pages/letter/[code].jsx
import { useState, useCallback } from 'react';
import Head from 'next/head';
import EnvelopeAnimation from '@/components/letter/EnvelopeAnimation';
import WritingReveal from '@/components/letter/WritingReveal';
import PasswordGate from '@/components/letter/PasswordGate';

export async function getServerSideProps(context) {
  const { code } = context.params;
  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/letters/resolve/${code}`);
    if (!res.ok) return { notFound: true };
    const data = await res.json();
    return { props: { letter: data, code } };
  } catch {
    return { notFound: true };
  }
}

export default function LetterView({ letter, code }) {
  const [phase, setPhase] = useState(letter.hasPassword ? 'password' : 'envelope');
  const [pages, setPages] = useState(letter.pages || []);
  const [title, setTitle] = useState(letter.title || '');

  const handlePasswordVerified = useCallback((data) => {
    setPages(data.pages);
    if (data.title) setTitle(data.title);
    setPhase('envelope');
  }, []);

  const handleEnvelopeComplete = useCallback(() => setPhase('reading'), []);

  return (
    <>
      <Head>
        <title>{title ? `${title} — Thư tay` : 'Thư tay'}</title>
        <meta name="description" content="Một bức thư tay dành cho bạn" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      {phase === 'password' && <PasswordGate code={code} onVerified={handlePasswordVerified} />}
      {phase === 'envelope' && <EnvelopeAnimation onComplete={handleEnvelopeComplete} />}
      {phase === 'reading' && <WritingReveal pages={pages} />}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add fe/pages/letter/
git commit -m "feat(letter): add public letter viewer page"
```

---

### Task 11: Frontend — Admin Letters Dashboard

**Files:**
- Create: `fe/pages/admin/letters.jsx`

- [ ] **Step 1: Create admin letters page**

Clone the pattern from `fe/pages/admin/shortlinks.jsx` and adapt:
- Replace `targetUrl` with multi-image upload (1-3 pages via Cloudinary widget from `fe/lib/cloudinary.js`)
- Add password field (optional) with show/hide toggle
- Form state: `{ code, title, password, isActive, pages: [{ imageUrl, width, height }] }`
- Cards show first page thumbnail (small), page count badge, lock icon if password-protected
- **Show processing status badge**: `processing` (yellow spinner), `ready` (green), `failed` (red with retry button)
- API endpoints: `/letters` instead of `/shortlinks`
- Copy URL: `yunkhngn.dev/letter/{code}` instead of `yunkhngn.dev/s/{code}`
- Keep all bulk actions (delete, activate/deactivate, select all)
- Add auto-refresh (poll every 5s) when any letter has `status: processing`

The Cloudinary upload uses `window.cloudinary.createUploadWidget()` with `folder: 'letters'`. The engineer should check `fe/lib/cloudinary.js` and `fe/components/admin/GalleryUpload.js` for existing Cloudinary widget usage patterns in this codebase.

- [ ] **Step 2: Commit**

```bash
git add fe/pages/admin/letters.jsx
git commit -m "feat(letter): add admin letters management page"
```

---

### Task 12: Admin Sidebar — Add Letters Link

**Files:**
- Modify: `fe/components/template/Admin/Navbar.jsx`

- [ ] **Step 1: Add Letters nav item**

Import `Mail` from `lucide-react`. Add to the nav items array:

```jsx
{ name: 'Letters', href: '/admin/letters', icon: Mail }
```

- [ ] **Step 2: Commit**

```bash
git add fe/components/template/Admin/Navbar.jsx
git commit -m "feat(letter): add letters to admin navigation"
```

---

### Task 13: Integration Testing

- [ ] **Step 1: Start backend** — `cd be && npm run start:dev`
- [ ] **Step 2: Start frontend** — `cd fe && npm run dev`
- [ ] **Step 3: Test admin flow** — Create, edit, toggle, delete letters at `/admin/letters`
- [ ] **Step 4: Test public flow** — Open `/letter/{code}`, verify envelope + writing reveal animations
- [ ] **Step 5: Test password flow** — Create password-protected letter, verify gate works
- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat(letter): handwritten letter sharing - complete feature"
```
