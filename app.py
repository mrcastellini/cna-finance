from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User
import os

app = Flask(__name__)
CORS(app)

# --- CONFIGURAÇÃO DE SEGURANÇA ---
# Chave secreta que deve ser igual no Frontend e no Cron-job
ADMIN_SECRET_KEY = "CNA_KEY_2026_SEGURA"

# --- CONFIGURAÇÃO DO BANCO DE DADOS ---
database_url = os.getenv('DATABASE_URL')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
else:
    database_url = 'sqlite:///database.db'

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# --- ROTA DE SAÚDE (Para o Cron-job manter o Render acordado) ---
@app.route('/api/health', methods=['GET'])
def health_check():
    # Rota pública e leve, apenas para dizer que o servidor está vivo
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
        balance=0.0 # Sem bônus inicial
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
    # Verifica se a chave secreta foi enviada no Header
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
    # Também protege a rota de alteração de saldo
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

# Rota para promoção de admin (mantenha protegida ou use apenas quando necessário)
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