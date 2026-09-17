from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "dermasmart")

client: AsyncIOMotorClient = None
db = None
db_available = False


async def connect_db():
    global client, db, db_available
    if not MONGO_URI:
        print("[WARN] MONGO_URI not set — running without database persistence.")
        db_available = False
        return
    try:
        client = AsyncIOMotorClient(
            MONGO_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
        # Ping to verify the connection is actually reachable
        await client.admin.command("ping")
        db = client[MONGO_DB_NAME]
        db_available = True
        print(f"[OK] Connected to MongoDB: {MONGO_DB_NAME}")
    except Exception as e:
        print(f"[WARN] MongoDB unavailable ({e}). Running without database persistence.")
        db_available = False
        db = None


async def close_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")


def get_db():
    return db


def is_db_available() -> bool:
    return db_available
