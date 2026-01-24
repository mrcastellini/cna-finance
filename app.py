from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Transaction

app = Flask(__name__)

# --- Configurações do Banco de Dados ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db.init_app(app)

# Cria as tabelas automaticamente
with app.app_context():
    db.create_all()

# ==========================================
# ROTAS DE AUTENTICAÇÃO E REGISTRO
# ==========================================

@app.route('/api/register', methods=['POST'])
def register():
    """Registra novos usuários garantindo o papel de 'user'."""
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Preencha todos os campos"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Este usuário já existe"}), 400

    new_user = User(
        username=username,
        password=password,
        role='user', # Segurança: Registro público é sempre 'user'
        balance=0.0
    )
    
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Conta criada!"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    """Valida credenciais e retorna o perfil do usuário."""
    data = request.json
    user = User.query.filter_by(
        username=data.get('username'), 
        password=data.get('password')
    ).first()
    
    if user:
        return jsonify({
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "balance": user.balance
        }), 200
    
    return jsonify({"error": "Usuário ou senha incorretos"}), 401

# ==========================================
# ROTAS ADMINISTRATIVAS (BUSCA POR NOME)
# ==========================================

@app.route('/api/admin/search-users', methods=['GET'])
def search_users():
    """Busca usuários por nome com correspondência parcial (LIKE)."""
    name_query = request.args.get('name', '')
    if not name_query:
        return jsonify([]), 200
        
    # O filtro 'ilike' busca nomes que contenham a sequência de caracteres
    users = User.query.filter(User.username.ilike(f"%{name_query}%")).all()
    
    output = []
    for u in users:
        output.append({
            "id": u.id,
            "username": u.username,
            "balance": u.balance,
            "role": u.role
        })
    
    return jsonify(output), 200

@app.route('/api/admin/update-balance', methods=['POST'])
def update_balance():
    """Adiciona ou remove saldo de um usuário via Admin."""
    data = request.json
    user = User.query.get(data.get('user_id'))
    amount = data.get('amount')
    
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404
        
    user.balance += amount
    
    # Registra a movimentação no histórico
    db.session.add(Transaction(
        amount=amount, 
        type='ajuste_admin', 
        user_id=user.id
    ))
    
    db.session.commit()
    return jsonify({"message": "Saldo atualizado", "new_balance": user.balance}), 200

# ==========================================
# ROTAS DO USUÁRIO
# ==========================================

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user_data(user_id):
    """Retorna os dados atualizados do perfil logado."""
    user = User.query.get_or_404(user_id)
    return jsonify({
        "id": user.id,
        "username": user.username,
        "balance": user.balance,
        "role": user.role
    }), 200

@app.route('/api/user/pay', methods=['POST'])
def process_payment():
    """Realiza um pagamento e abate do saldo do usuário."""
    data = request.json
    user = User.query.get(data.get('user_id'))
    value = data.get('value')
    
    if not user or user.balance < value:
        return jsonify({"error": "Saldo insuficiente"}), 400
        
    user.balance -= value
    db.session.add(Transaction(
        amount=-value, 
        type='pagamento', 
        user_id=user.id
    ))
    
    db.session.commit()
    return jsonify({"message": "Sucesso", "remaining_balance": user.balance}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)