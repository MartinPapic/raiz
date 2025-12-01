from sqlmodel import Session, select
from app.database import get_session, create_db_and_tables
from app.models import User
from app.auth import verify_password, get_password_hash

def check_users():
    # Create a session manually since we are outside of the request context
    from sqlmodel import create_engine
    sqlite_file_name = "database.db"
    sqlite_url = f"sqlite:///{sqlite_file_name}"
    engine = create_engine(sqlite_url)
    
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        print(f"Found {len(users)} users in database:")
        for user in users:
            print(f"- Username: {user.username}, Role: {user.role}")
            
            if user.username == "admin":
                print("  Verifying 'admin' password (admin123)...")
                if verify_password("admin123", user.hashed_password):
                    print("  SUCCESS: Password 'admin123' is correct.")
                else:
                    print("  FAILURE: Password 'admin123' is INCORRECT.")
                    
                    # Optional: Reset it
                    # print("  Resetting admin password to 'admin123'...")
                    # user.hashed_password = get_password_hash("admin123")
                    # session.add(user)
                    # session.commit()
                    # print("  Password reset.")

if __name__ == "__main__":
    check_users()
