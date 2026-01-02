from sqlmodel import Session, select, create_engine
from app.models import User

# Connect to the database
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url)

def grant_admin():
    target_emails = ["ma.papic@duocuc.cl", "mapapicv@gmail.com"]
    
    with Session(engine) as session:
        # First, list all users to see what we have
        print("--- Current Users ---")
        all_users = session.exec(select(User)).all()
        for user in all_users:
            print(f"ID: {user.id}, Username: {user.username}, Role: {user.role}")
            
        print("\n--- Updating Roles ---")
        for email in target_emails:
            user = session.exec(select(User).where(User.username == email)).first()
            if user:
                if user.role != "admin":
                    print(f"Updating {email} to admin...")
                    user.role = "admin"
                    session.add(user)
                    session.commit()
                    session.refresh(user)
                    print(f"✅ {email} is now ADMIN.")
                else:
                    print(f"ℹ️ {email} is already admin.")
            else:
                print(f"⚠️ User '{email}' not found in database. They must log in at least once.")

if __name__ == "__main__":
    grant_admin()
