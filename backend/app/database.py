from prisma import Prisma

db = Prisma()

async def get_db():
    if not db.is_connected():
        await db.connect()
    return db
