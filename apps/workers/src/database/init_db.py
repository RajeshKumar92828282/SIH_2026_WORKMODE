from database.connection import Base, engine
from database.models import StaticFare, LiveFare, IndexResult


def init_db():
    print("Resetting database tables...")

    Base.metadata.drop_all(bind=engine)

    print("Creating database tables...")

    Base.metadata.create_all(bind=engine)

    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()