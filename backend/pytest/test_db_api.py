from unittest import TestCase
import pytest
from . import *

class TestDB(TestCase):
    def setUp(self):
        """Create a new session before each test."""
        db.delete_all()
    
    def test_add_data(self):
        db.add_data("IIT Patna", company_name="Google", role="CTO", ctc=50000)
        db.commit()
        assert len(db.fetch_all_colleges()) == 1
        assert len(db.fetch_all_companies()) == 1
        assert db.fetch_all_colleges()[0].college_name == "IIT Patna"
        assert db.fetch_all_companies()[0].company_name == "Google"
    def test_add_data_person(self):
        db.add_data("IIT Patna", company_name="Google", role="CTO", ctc=50000, hr_name="laksh")
        db.commit()
        assert len(db.fetch_all_colleges()) == 1
        assert len(db.fetch_all_companies()) == 1
        item = db.fetch_all_data()[0]
        assert item.person is not None
        assert item.person.name == "laksh"