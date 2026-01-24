from app import app
from models import db, User

def seed_database():
    with app.app_context():
        # 1. Limpa o banco atual para evitar duplicatas (opcional)
        db.drop_all()
        db.create_all()

        print("Limpando e criando novas tabelas...")

        # 2. Cria um Usuário Administrador
        admin = User(
            username="admin_master",
            password="123", # Em um sistema real, use hash!
            role="admin",
            balance=0.0
        )

        # 3. Cria um Usuário Comum para testes (ID 1)
        common_user = User(
            username="joao_poupador",
            password="123",
            role="user",
            balance=50.0 # Começa com R$ 50,00
        )

        # 4. Adiciona ao banco
        db.session.add(admin)
        db.session.add(common_user)
        db.session.commit()

        print("---")
        print(f"Sucesso! Usuário '{common_user.username}' criado com ID: {common_user.id}")
        print(f"Saldo inicial: R$ {common_user.balance}")
        print("---")

if __name__ == "__main__":
    seed_database()