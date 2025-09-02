from config import users_col
import time

def create_user(user_id, name, username):
    new_user = {
        "telegram_id": user_id,
        "name": name,
        "username": username,
        "coins": 0,
        "referrals": 0,
        "created_at": time.time()
    }
    users_col.insert_one(new_user)
    return new_user

def get_user(user_id):
    return users_col.find_one({"telegram_id": user_id})
