# Dockerfile

# 1️⃣ Base image
FROM python:3.10-slim

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl build-essential && \
    rm -rf /var/lib/apt/lists/*

# 4️⃣ Copy requirements
COPY requirements.txt .

# 5️⃣ Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 6️⃣ Copy project files
COPY ./src ./src
COPY ./indexes ./indexes
COPY ./data ./data

ENV GROQ_API_KEY=""

EXPOSE 8000
CMD ["uvicorn", "src.rag_api:app", "--host", "0.0.0.0", "--port", "8000"]
