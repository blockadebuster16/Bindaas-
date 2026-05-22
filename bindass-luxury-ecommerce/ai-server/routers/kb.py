"""
Knowledge Base Router
=====================
Handles saving and retrieving unstructured company policies.
Now supports direct file uploads (PDF, DOCX).
"""
from fastapi import APIRouter, Request, HTTPException, Depends, File, UploadFile
from pydantic import BaseModel
from typing import Optional
from routers.owners import get_current_owner
import fitz  # PyMuPDF
import docx
import io

router = APIRouter()

class KBSaveRequest(BaseModel):
    content: str

@router.get("/")
async def get_kb(request: Request, owner: dict = Depends(get_current_owner)):
    db = request.app.state.db
    owner_id = owner["id"]
    doc = await db["knowledge_base"].find_one({"owner_id": owner_id})
    if not doc:
        return {"content": ""}
    return {"content": doc.get("content", "")}

@router.post("/save")
async def save_kb(body: KBSaveRequest, request: Request, owner: dict = Depends(get_current_owner)):
    db = request.app.state.db
    owner_id = owner["id"]
    await db["knowledge_base"].update_one(
        {"owner_id": owner_id},
        {"$set": {"content": body.content}},
        upsert=True
    )
    return {"status": "success"}

@router.post("/upload")
async def upload_kb_file(
    request: Request, 
    file: UploadFile = File(...), 
    owner: dict = Depends(get_current_owner)
):
    db = request.app.state.db
    owner_id = owner["id"]
    
    content = ""
    file_bytes = await file.read()
    filename = file.filename.lower()

    try:
        if filename.endswith(".pdf"):
            # Extract from PDF
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                content += page.get_text()
            doc.close()
        
        elif filename.endswith(".docx"):
            # Extract from DOCX
            doc = docx.Document(io.BytesIO(file_bytes))
            content = "\n".join([p.text for p in doc.paragraphs])
        
        elif filename.endswith(".txt"):
            # Extract from TXT
            content = file_bytes.decode("utf-8")
        
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT.")

        if not content.strip():
            raise HTTPException(status_code=400, detail="The uploaded file seems to be empty or contains no extractable text.")

        # Update MongoDB
        await db["knowledge_base"].update_one(
            {"owner_id": owner_id},
            {"$set": {"content": content}},
            upsert=True
        )
        
        return {"status": "success", "extracted_text": content[:500] + "..." if len(content) > 500 else content}

    except Exception as e:
        if isinstance(e, HTTPException): raise e
        print(f"[!] KB Upload Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
