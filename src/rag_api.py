# src/rag_api.py
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil

from src.rag_core import load_rag_components, run_rag_query
from src.ingest_pdfs import run_ingestion

app = FastAPI(title="RAG + Ollama API")

#  Enable CORS (important for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🔧 Loading RAG components...")
rag_chain = load_rag_components()
print("RAG system initialized!")


class QueryRequest(BaseModel):
    question: str


@app.get("/")
def root():
    return {"message": "🚀 RAG + Ollama API is live!"}


@app.post("/api/query")
async def query_api(request: QueryRequest):
    """
    Endpoint: /api/query
    Accepts JSON: { "question": "your query" }
    Returns: { "question": ..., "answer": ... }
    """
    question = request.question
    print(f" Incoming question: {question}")
    answer = run_rag_query(rag_chain, question)
    return {"question": question, "answer": answer}


#  NEW: PDF Upload Endpoint
@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF file from frontend and save it to the 'data' folder.
    """
    # Define path for saving
    upload_dir = os.path.join(os.getcwd(), "data")
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)

    # Save file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        

    print(f"📄 Uploaded file saved to: {file_path}")
    msg = run_ingestion(input_dir=upload_dir, index_dir=os.path.join(os.getcwd(), "indexes/pdf_faiss"))

    global rag_chain
    try:
        rag_chain = load_rag_components()
        print("RAG components reloaded after ingestion.")
    except Exception as e:
        print(f" Failed to reload RAG components: {e}")   
        return {"message": f"File '{file.filename}' uploaded, but failed to reload RAG components: {e}"}

    return {"message": f"File '{file.filename}' uploaded successfully!", "path": file_path}
