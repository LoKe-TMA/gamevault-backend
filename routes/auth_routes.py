from flask import Blueprint, request, jsonify
import jwt, time, hmac, hashlib
from config import JWT_SECRET, BOT_TOKEN
from models.user_model import get_user, create_user

auth_bp = Blueprint("auth", __name__)

def verify_telegram_auth(auth_data: dict, bot_token: str) -> bool:
    check_hash = auth_data.pop("hash")
    data_check_string = "\n".join([f"{k}={v}" for k, v in sorted(auth_data.items())])
    secret_key = hashlib.sha256(bot_token.encode("utf-8")).digest()
    hmac_string = hmac.new(secret_key, data_check_string.encode("utf-8"), hashlib.sha256).hexdigest()
    return hmac_string == check_hash

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data:
        return jsonify({"error": "No data"}), 400

    if not verify_telegram_auth(data.copy(), BOT_TOKEN):
        return jsonify({"error": "Invalid auth"}), 401

    user_id = data["id"]
    name = data.get("first_name", "") + " " + data.get("last_name", "")
    username = data.get("username", "")

    user = get_user(user_id)
    if not user:
        user = create_user(user_id, name.strip(), username)

    token = jwt.encode({"telegram_id": user_id, "exp": time.time() + 86400}, JWT_SECRET, algorithm="HS256")
    return jsonify({"token": token, "user": {"name": user["name"], "coins": user["coins"]}})
