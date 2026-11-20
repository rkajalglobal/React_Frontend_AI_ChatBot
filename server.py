import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# Import your unmodified backend logic directly
import backend as demo

load_dotenv()
app = FastAPI()

# Enable CORS so your React application can talk to this server smoothly
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SINGLE SESSION MANAGEMENT: A single global memory instance
SINGLE_CHAT_MEMORY = demo.demo_memory()

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat_endpoint(payload: ChatRequest):
    global SINGLE_CHAT_MEMORY
    try:
        # Executes your exact code unmodified, passing the single global memory
        reply, updated_memory = demo.demo_conversation(
            input_text=payload.message, 
            memory=SINGLE_CHAT_MEMORY
        )
        
        # Keep the updated memory object inside the single global tracker
        SINGLE_CHAT_MEMORY = updated_memory
        
        return {"reply": reply}
    except Exception as e:
            print(f"Chat endpoint error: {type(e).__name__}: {e}")
            raise HTTPException(
            status_code=500,
            detail="Chat processing failed. Check the server logs."
        )

@app.post("/api/reset")
async def reset_endpoint():
    global SINGLE_CHAT_MEMORY
    # Wipes out the memory object instance and replaces it with a fresh one
    SINGLE_CHAT_MEMORY = demo.demo_memory()
    return {"status": "success", "message": "Global conversation history cleared."}



if __name__ == "__main__":
  import uvicorn
    # Hardcode the IPv4 address directly into the loop to prevent IPv6 redirection
  uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)