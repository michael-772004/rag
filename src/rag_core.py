# src/rag_core.py
import os
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_openai import ChatOpenAI  # For OpenAI-compatible APIs (like Grok)

def load_rag_components():
    """
    Loads FAISS, embeddings, retriever, and connects to the Grok API for generation.
    Returns the full RAG chain ready for queries.
    """
    print("🚀 Initializing RAG system with Grok API...")

    cwd = os.getcwd()
    index_path = os.path.join(cwd, "indexes/pdf_faiss")

    faiss_index = os.path.join(index_path, "index.faiss")
    faiss_pkl = os.path.join(index_path, "index.pkl")

    if not os.path.exists(faiss_index) or not os.path.exists(faiss_pkl):
        raise FileNotFoundError(" FAISS index or metadata file missing.")

    print("Loading embeddings and FAISS index...")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)

    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

    #  Connect to Grok (xAI) via OpenAI-compatible API
    grok_api_key = os.getenv("GROQ_API_KEY")
    if not grok_api_key:
        raise EnvironmentError(" GROQ_API_KEY not found. Set it in your environment variables.")

    # Grok is OpenAI-compatible, so we use ChatOpenAI with custom base_url
    # llm = ChatOpenAI(
    #     api_key=grok_api_key,
    #     base_url="https://api.x.ai/v1",  # Grok API endpoint
    #     model="grok-2",                  # Example Grok model
    #     temperature=0.2,
    #     max_tokens=512,
    # )

    # this is for rag with groq
    llm = ChatOpenAI(
        api_key=os.getenv("GROQ_API_KEY"),
        base_url="https://api.groq.com/openai/v1",
        model="llama-3.1-8b-instant",
        temperature=0.2,
        max_tokens=512,
    )

    prompt = ChatPromptTemplate.from_template("""
    You are a helpful assistant. Use the following context to answer the question accurately.
    If the answer is not in the context, say "I don’t have enough information to answer that."

    Context:
    {context}

    Question: {input}
    """)

    combine_docs_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, combine_docs_chain)

    print(" RAG components ready with Grok model.")
    return rag_chain


def run_rag_query(rag_chain, query: str):
    """
    Runs a user query through the RAG chain and returns the answer.
    """
    if not query.strip():
        return " Question cannot be empty."

    print(f" Query received: {query}")
    try:
        result = rag_chain.invoke({"input": query})
        return result.get("answer") or result.get("output_text", " No response generated.")
    except Exception as e:
        print(f"Error in RAG pipeline: {e}")
        return f"Error: {str(e)}"
