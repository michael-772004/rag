# src/ingest_pdfs.py
import argparse
from pathlib import Path

from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

def load_pdfs(input_dir: str):
    loader = DirectoryLoader(
        input_dir,
        glob="**/*.pdf",
        loader_cls=PyPDFLoader,
        show_progress=True
    )
    docs = loader.load()
    print(f"[1/4] Loaded {len(docs)} pages across PDFs")
    if not docs:
        print("No PDFs found. Put some .pdf files under the data/ folder.")
    return docs

def split_docs(docs):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        add_start_index=True,
    )
    chunks = splitter.split_documents(docs)
    print(f"[2/4] Split into {len(chunks)} chunks")
    return chunks

def build_and_save_index(chunks, index_dir: str):
    print("[3/4] Creating embeddings (first time takes a little longer)...")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = FAISS.from_documents(chunks, embeddings)

    Path(index_dir).mkdir(parents=True, exist_ok=True)
    vectorstore.save_local(index_dir)
    print(f"[4/4] Index saved to {index_dir}")

def run_ingestion(input_dir: str = "../data", index_dir: str = "../indexes/pdf_faiss"):
    """
    Run the full ingestion pipeline programmatically (no argparse).
    """
    docs = load_pdfs(input_dir)
    if not docs:
        print("❌ No PDFs found.")
        return "No PDFs found."

    chunks = split_docs(docs)
    if not chunks:
        print("⚠️ No chunks generated. PDF might be image-only.")
        return "No chunks generated."

    build_and_save_index(chunks, index_dir)
    print("✅ Ingestion complete.")
    return "Ingestion complete."

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input_dir", default="../data")
    parser.add_argument("--index_dir", default="../indexes/pdf_faiss")
    args = parser.parse_args()
    run_ingestion(args.input_dir, args.index_dir)
    
if __name__ == "__main__":
    main()
