from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User
import os
import json
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env (apenas para teste local)
load_dotenv()

app = Flask(__name__)

# --- CONFIGURAÇÃO DE SEGURANÇA (CORS) ---
# Substitua pelo seu domínio final quando o SSL estiver ativo
CORS(app)

# --- CHAVES SECRETAS (ESCONDIDAS) ---
# Se não encontrar no sistema, usa um valor padrão (apenas para dev)
ADMIN_SECRET_KEY = os.getenv("MINHA_API_KEY")

# --- CONFIGURAÇÃO DO BANCO DE DADOS ---
database_url = os.getenv('BANCO_URL')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
else:
    database_url = 'sqlite:///itaimpaulista.db'

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# --- ROTA DE SAÚDE ---
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "alive"}), 200

# --- ROTAS DE AUTENTICAÇÃO E USUÁRIO ---

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username'), password=data.get('password')).first()
    if user:
        return jsonify({
            "id": user.id, "username": user.username, 
            "role": user.role, "balance": user.balance
        }), 200
    return jsonify({"error": "Credenciais inválidas"}), 401

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify({
            "id": user.id, 
            "username": user.username, 
            "role": user.role, 
            "balance": user.balance
        }), 200
    return jsonify({"error": "Usuário não encontrado"}), 404

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Usuário já existe"}), 400
    
    new_user = User(
        username=username, 
        password=data.get('password'),
        role='user',
        balance=0.0 
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Sucesso"}), 201

@app.route('/api/user/pay', methods=['POST'])
def user_pay():
    data = request.json
    user = User.query.get(data.get('user_id'))
    value = float(data.get('value', 0))

    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404
    
    if user.balance < value:
        return jsonify({"error": "Saldo insuficiente"}), 400

    user.balance -= value
    db.session.commit()
    return jsonify({"message": "Sucesso", "new_balance": user.balance}), 200

# --- ROTAS ADMINISTRATIVAS PROTEGIDAS ---

@app.route('/api/admin/users', methods=['GET'])
def list_users():
    token = request.headers.get('X-Admin-Token')
    if token != ADMIN_SECRET_KEY:
        return jsonify({"error": "Acesso negado"}), 403

    try:
        users = User.query.all()
        return jsonify([{
            "id": u.id, "username": u.username, 
            "balance": u.balance, "role": u.role
        } for u in users]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/update-balance', methods=['POST'])
def update_balance():
    token = request.headers.get('X-Admin-Token')
    if token != ADMIN_SECRET_KEY:
        return jsonify({"error": "Acesso negado"}), 403

    data = request.json
    user = User.query.get(data.get('user_id'))
    amount = float(data.get('amount', 0))
    
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404
        
    user.balance += amount
    if user.balance < 0: user.balance = 0
        
    db.session.commit()
    return jsonify({"message": "Saldo atualizado", "new_balance": user.balance}), 200

# --- ROTA DE BACKUP ---
@app.route('/api/admin/export-db', methods=['GET'])
def export_db():
    token = request.headers.get('X-Admin-Token')
    if token != ADMIN_SECRET_KEY:
        return jsonify({"error": "Acesso negado"}), 403
    
    users = User.query.all()
    data = [{
        "id": u.id,
        "username": u.username,
        "password": u.password,
        "balance": u.balance,
        "role": u.role
    } for u in users]
    
    return jsonify({
        "info": "Backup CNA Finance 2026",
        "total_users": len(data),
        "data": data
    }), 200

@app.route('/api/make-me-admin/<username>', methods=['GET'])
def make_me_admin(username):
    user = User.query.filter_by(username=username).first()
    if user:
        user.role = 'admin'
        db.session.commit()
        return f"Usuário {username} agora é ADMIN!", 200
    return "Não encontrado", 404

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)