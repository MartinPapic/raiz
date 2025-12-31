from sqlmodel import Session, select
from app.database import engine
from app.models import User

def set_admin():
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        
        if not users:
            print("No users found in the database.")
            return

        print("\n--- Registered Users ---")
        for i, user in enumerate(users):
            print(f"{i + 1}. ID: {user.id} | Username: {user.username} | Role: {user.role}")
        
        print("\n-----------------------")
        choice = input("Enter the number of the user to make Admin (or 'q' to quit): ")
        
        if choice.lower() == 'q':
            return

        try:
            index = int(choice) - 1
            if 0 <= index < len(users):
                target_user = users[index]
                target_user.role = "admin"
                session.add(target_user)
                session.commit()
                session.refresh(target_user)
                print(f"\nSuccess! User '{target_user.username}' is now an Admin.")
            else:
                print("Invalid selection.")
        except ValueError:
            print("Invalid input.")

if __name__ == "__main__":
    set_admin()
