from ..models import *


db = PostgreSQL(db_url='sqlite:///:memory:')

# import os
# db = PostgreSQL(name="database.db", dir=os.path.dirname(__file__))

