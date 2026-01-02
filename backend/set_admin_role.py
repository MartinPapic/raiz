from sqlmodel import Session, select, create_engine
from app.models import User

# Connect to the database
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url)

def set_admin():
    target_username = "martin" # Corrected username based on check_users output
    print(f"Updating user {target_username} to admin role...")
    
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == target_username)).first()
        if user:
            print(f"User found: {user.username}, current role: {user.role}")
            user.role = "admin"
            session.add(user)
            session.commit()
            session.refresh(user)
            print(f"User updated. New role: {user.role}")
        else:
            print("User not found.")

if __name__ == "__main__":
    set_admin()
