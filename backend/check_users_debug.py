from sqlmodel import Session, select
from app.database import engine
from app.models import User

def check_users():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        print(f"Found {len(users)} users:")
        for user in users:
            print(f"ID: {user.id}, Username: {user.username}, Role: {user.role}")

if __name__ == "__main__":
    check_users()
