from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User
import os

app = Flask(__name__)

# Configuração do CORS: Permite que seu site no GitHub Pages acesse esta API
CORS(app)

# Configuração do Banco de Dados
# Quando você adicionar o PostgreSQL no Render, ele usará a DATABASE_URL
# Caso contrário, usará um banco SQLite local chamado database.db
database_url = os.getenv('DATABASE_URL', 'sqlite:///database.db')
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Cria as tabelas no banco de dados se não existirem
with app.app_context():
    db.create_all()

# --- ROTAS DA API ---

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username, password=password).first()
    
    if user:
        return jsonify({
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "balance": user.balance
        }), 200
    
    return jsonify({"error": "Usuário ou senha inválidos"}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Este usuário já existe"}), 400

    # Cria novo usuário com saldo inicial de 100.00
    new_user = User(username=username, password=password, balance=100.00, role='user')
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "Usuário registrado com sucesso"}), 201

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

@app.route('/api/user/pay', methods=['POST'])
def make_payment():
    data = request.json
    user_id = data.get('user_id')
    value = data.get('value')

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404
    
    if user.balance < value:
        return jsonify({"error": "Saldo insuficiente"}), 400

    user.balance -= value
    db.session.commit()
    
    return jsonify({"message": "Pagamento realizado", "new_balance": user.balance}), 200

# Rota para o Admin visualizar todos os usuários (usada no AdminDashboard)
@app.route('/api/admin/users', methods=['GET'])
def list_users():
    users = User.query.all()
    return jsonify([{
        "id": u.id, 
        "username": u.username, 
        "balance": u.balance, 
        "role": u.role
    } for u in users]), 200

if __name__ == '__main__':
    # O Render define a porta automaticamente, localmente usa 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)