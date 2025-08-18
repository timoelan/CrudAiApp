from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os





load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
)

@app.get("/")
def root():
    return {'message' : 'Hello World'}


@app.get("/db-test")
def db_test():
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    return {"DB Host": db_host, "DB Port": db_port}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")