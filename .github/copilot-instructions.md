# Copilot instructions for ReactFrontendChatBot

## Project overview

This repository is a small full-stack AI demo that combines:

- a React frontend in `src/` and `public/`
- a FastAPI backend in `server.py` that exposes the chat API
- LangChain/OpenAI orchestration in `backend.py`
- a separate Streamlit demo in `frontend.py`

The app is built around a single conversational memory object that is shared across one session. The backend holds the conversation state and the React UI sends JSON requests to the FastAPI server rather than talking directly to the LLM.

## Setup and commands

### Python environment

This project targets Python 3.12 (`.python-version` and `pyproject.toml`). A working OpenAI key is required.

Typical setup:

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
# or, when using uv:
uv sync
```

Create a `.env` file before running the LLM-backed flows:

```env
OPENAI_API_KEY=your_key_here
```

### Run the app

```bash
# React dev server
npm install
npm start
```

```bash
# FastAPI backend
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

```bash
# Streamlit version of the chat UI
streamlit run frontend.py
```

### Test and lint commands

There are no repository-level test or lint scripts configured in `package.json` or `pyproject.toml` at the moment. There is no pytest suite or ESLint config in the project root, so do not assume a hidden test runner exists.

If you add Python tests later, the expected command is:

```bash
pytest path/to/test_file.py -q
```

If you add JS tests later, the usual command would be the project script from `package.json` (for example, `npm test`), but this repo currently does not define such a script.

## High-level architecture

### `backend.py`

This file contains the LLM wiring, prompt templates, and conversation history logic. The important pieces are:

- `demo_chatbot()` creates the `ChatOpenAI` client from `OPENAI_API_KEY`
- `demo_memory()` creates a fresh in-memory `InMemoryChatMessageHistory`
- `demo_conversation()` runs one turn of chat while preserving session memory via `RunnableWithMessageHistory`
- `Chat_Prompt1` and `few_shot_prompt` define the assistant persona and examples

The LLM and chat-memory logic are intentionally kept here so both the FastAPI layer and Streamlit layer can reuse the same behavior.

### `server.py`

This is the FastAPI wrapper that exposes the app to the browser. It is the HTTP boundary for the React frontend and contains:

- `ChatRequest` model with a `message: str` field
- `POST /api/chat` for sending a message and returning the assistant reply
- `POST /api/reset` for wiping the global conversation memory
- a single global `SINGLE_CHAT_MEMORY` instance used for the current session

The server exists to preserve the original backend logic while making it accessible over HTTP.

### `frontend.py`

This is a Streamlit prototype of the same assistant. It uses the same `demo_conversation()` function and keeps a `st.session_state.memory` object for history. It is a standalone UI and is not the primary app flow when the React frontend is running.

### `src/App.js`

This is the main browser frontend. It renders the chat interface and makes direct fetch calls to the Python API. The current UI expects the backend to be running on `http://127.0.0.1:8000` and posts JSON like:

```json
{ "message": "hello" }
```

## Key conventions in this repo

- Keep the actual agent logic in `backend.py`; avoid reimplementing the prompt/memory logic in the web layer.
- Use the existing `demo_memory()` and `demo_conversation()` API as the canonical entry points for the conversation flow.
- Keep configuration in `.env` rather than hardcoding secrets or model settings in the app code.
- Treat the backend as a single-session memory app: `SINGLE_CHAT_MEMORY` is intentionally global and resettable, not per-user or long-lived in a database.
- The repo is intentionally lightweight and uses direct local development wiring instead of a full production deployment stack.
- `requirements.txt` and `pyproject.toml` both define Python dependencies; prefer the `pyproject.toml`/`uv` flow when adding or upgrading dependencies, and keep the requirements file in sync when needed.

## Working style reminders

- Prefer minimal changes that preserve the current architecture instead of introducing a new service layer or new state management model.
- When changing the bot behavior, update the prompt logic in `backend.py` before changing the UI markup.
- When changing API contracts, keep the React frontend and FastAPI server in sync.

## Files to check first when making a change

- `backend.py` for prompt, memory, and model behavior
- `server.py` for API surface and session handling
- `src/App.js` for UI behavior and API calls
- `requirements.txt` / `pyproject.toml` for dependencies and tooling
