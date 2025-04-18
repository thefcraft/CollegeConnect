import os

basepath = os.path.dirname(__file__)
if os.path.exists(os.path.join(basepath, '.env')):
    from dotenv import load_dotenv; 
    load_dotenv(dotenv_path=os.path.join(basepath, '.env'))
    
# DATABASE_URL = os.getenv("DATABASE_URL")
# DATABASE_URL: str = 'sqlite:///database.db' # 'sqlite:///:memory:'  # Replace with your database URL
# HOST: str = '0.0.0.0'
# PORT: int = 5000
# DEBUG:bool = True

HOST = os.getenv("HOST", "127.0.0.1")
DATABASE_URL = os.getenv("DATABASE_URL")
PORT = int(os.getenv("PORT", 8000))
DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")


if DATABASE_URL is None:
    if DEBUG:
        DATABASE_URL = 'sqlite:///instance/database.db' 
        if not os.path.exists(os.path.join(basepath, 'instance')):
            os.mkdir(os.path.join(basepath, 'instance'))
    else:
        raise ValueError("DATABASE_URL environment variable not set.")
