import motor.motor_asyncio
import asyncio

async def list_owners():
    client = motor.motor_asyncio.AsyncIOMotorClient("mongodb+srv://parthmanjrekar12_db_user:6JVs3vXvvnDzduMe@neuralnexus.dwj7pqh.mongodb.net/?appName=NeuralNexus")
    db = client["nexa_db"]
    owners = await db["owners"].find().to_list(100)
    for o in owners:
        print(f"Email: {o.get('email')}, Company: {o.get('company_name')}")
    client.close()

if __name__ == "__main__":
    asyncio.run(list_owners())
