from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI()

# 🔥 Load model (only once)
model = SentenceTransformer("all-MiniLM-L6-v2")

class TextRequest(BaseModel):
    text: str

@app.post("/embed")
def embed(req: TextRequest):
    embedding = model.encode(req.text).tolist()
    return {"embedding": embedding}