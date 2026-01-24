from sqlmodel import Session, select
from app.database import engine, create_db_and_tables
from app.models import User
from app.auth import get_password_hash

def seed_users():
    create_db_and_tables()
    with Session(engine) as session:
        # Create Admin
        admin = session.exec(select(User).where(User.username == "admin")).first()
        if not admin:
            print("Creating admin user...")
            hashed_password = get_password_hash("admin123")
            admin = User(username="admin", hashed_password=hashed_password, role="admin")
            session.add(admin)
            print("Admin user created.")
        else:
            print("Admin user already exists. Updating role...")
            admin.role = "admin"
            session.add(admin)

        # Create Standard User
        user = session.exec(select(User).where(User.username == "user")).first()
        if not user:
            print("Creating standard user...")
            hashed_password = get_password_hash("user123")
            user = User(username="user", hashed_password=hashed_password, role="user")
            session.add(user)
            print("Standard user created.")
        else:
            print("Standard user already exists.")
        
        session.commit()

if __name__ == "__main__":
    seed_users()
