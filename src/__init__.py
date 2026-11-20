# def main() -> None:
#     print("Hello from reactfrontendchatbot!")

import uvicorn
# Import the app instance from your server.py file
from server import app

def main() -> None:
    print("🚀 Starting the BEPEC RAG Chatbot Server via Package Manager...")
    # This launches the FastAPI server directly when the tool calls main()
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)