
# DATABASE_URL = os.getenv("DATABASE_URL")
DATABASE_URL: str = 'sqlite:///database.db' # 'sqlite:///:memory:'  # Replace with your database URL
HOST: str = '0.0.0.0'
PORT: int = 5000
DEBUG:bool = True