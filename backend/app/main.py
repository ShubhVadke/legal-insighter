from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
import PyPDF2
import io
import os

load_dotenv()

from app.analyzer import analyze_legal_text

app = FastAPI(title="ELI5 Legal Reader API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🧠 Global memory temporary text store karne ke liye (Production mein database/session use hota hai)
# Isse bina database ke hamara chat chalu ho jayega
DOCUMENT_STORE = {"last_extracted_text": ""}

class ChatRequest(BaseModel):
    question: str

@app.get("/")
def read_root():
    return {"message": "Backend is Working!"}

@app.post("/api/analyze")
async def analyze_document(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files allowed!")
    
    try:
        contents = await file.read()
        pdf_file = io.BytesIO(contents)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        extracted_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Cannot find readable text in PDF")
        
        # 🔥 Text ko memory mein save kar lo chat ke liye
        DOCUMENT_STORE["last_extracted_text"] = extracted_text
        
        analysis_report = analyze_legal_text(extracted_text)
        
        return {
            "status": "success",
            "file_name": file.filename,
            "analysis": analysis_report
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# 🔥 NAYA ROUTE: Chat ke liye
@app.post("/api/chat")
async def chat_with_document(req: ChatRequest):
    text_context = DOCUMENT_STORE.get("last_extracted_text", "")
    if not text_context:
        raise HTTPException(status_code=400, detail="Upload a document first only then can I give you an answer!")
    
    groq_api_key = os.getenv("GROQ_API_KEY")
    client = OpenAI(base_url="https://api.groq.com/openai/v1", api_key=groq_api_key)
    
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system", 
                    "content": f"You are a helpful assistant. Answer the user's question based strictly on this document text. Keep the answer friendly, short, and in English (English).\n\nDocument Text:\n{text_context}"
                },
                {"role": "user", "content": req.question}
            ],
            temperature=0.3
        )
        return {"answer": response.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat Error: {str(e)}")
