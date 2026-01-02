from sqlmodel import Session, select, create_engine
from app.models import User

# Connect to the database
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url)

def check_users():
    with Session(engine) as session:
        statement = select(User)
        users = session.exec(statement).all()
        print(f"Total users: {len(users)}")
        
        for user in users:
            print(f"ID: {user.id}, Username: {user.username}, Role: {user.role}")

if __name__ == "__main__":
    check_users()
