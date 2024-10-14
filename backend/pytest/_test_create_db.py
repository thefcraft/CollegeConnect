from unittest import TestCase
import pytest
from . import *

# class TestCreate(TestCase):
#     @classmethod
#     def setUpClass(cls):
#         cls.session = db.session
        
#     def setUp(self):
#         """Create a new session before each test."""
#         db.delete_all()
#     def tearDown(self):
#         self.session.rollback()
    
#     def test_create_company(self):
#         company = Company(company_name="TechCorp", role="Developer", ctc=60000.0)
#         self.session.add(company)
#         self.session.commit()

#         # Fetch the company back from the database
#         fetched_company: Optional[Company] = self.session.query(Company).filter_by(company_name="TechCorp").one()
#         assert fetched_company is not None
#         assert fetched_company.role == "Developer"
#         assert fetched_company.ctc == 60000.0
#     def test_create_college(self):
#         college = College(college_name="Tech University")
#         self.session.add(college)
#         self.session.commit()

#         # Fetch the college back from the database
#         fetched_college:Optional["College"] = self.session.query(College).filter_by(college_name="Tech University").one()
#         assert fetched_college is not None
#         assert fetched_college.college_name == "Tech University"
    
#     def test_link_company_to_college(self):
#         company = Company(company_name="TechCorp", role="Developer", ctc=60000.0)
#         college = College(college_name="Tech University")

#         self.session.add(company)
#         self.session.add(college)
#         self.session.commit()

#         Item(college, company).link(self.session)

#         # Verify the relationship
#         assert college in company.colleges
    
#     def test_get_or_create_company(self):
#         company = Company.get_or_create(self.session, "TechCorp", "Developer", 60000.0)
#         assert company is not None

#         # Create the same company again to test get
#         company2 = Company.get_or_create(self.session, "TechCorp", "Developer", 60000.0)
#         assert company is company2
    
#     def test_update_company(self):
#         company = Company(company_name="TechCorp", role="Developer", ctc=60000.0)
#         self.session.add(company)
#         self.session.commit()

#         company.update(role="Senior Developer", ctc=80000.0)
#         self.session.commit()

#         # Verify the updates
#         updated_company:Optional["Company"] = self.session.query(Company).filter_by(company_name="TechCorp").one()
#         assert updated_company is not None
#         assert  updated_company.role == "Senior Developer"
#         assert  updated_company.ctc == 80000.0
    
#     # def test_delete_company(self):
#     #     company = Company(company_name="TechCorp", role="Developer", ctc=60000.0)
#     #     self.session.add(company)
#     #     self.session.commit()

#     #     self.session.delete(company)
#     #     self.session.commit()

#     #     # Verify the company is deleted
#     #     assert self.session.query(Company).filter_by(company_name="TechCorp").one_or_none() is None
    
#     # def test_delete_company_delete_relation(self):
#     #     company = Company(company_name="TechCorp", role="Developer", ctc=60000.0)
#     #     college = College(college_name="Tech University")

#     #     self.session.add(company)
#     #     self.session.add(college)
#     #     self.session.commit()
#     #     Item(college, company).link(self.session)

#     #     self.session.delete(company)
#     #     self.session.commit()

#     #     # Verify the company is deleted
#     #     assert self.session.query(Company).filter_by(company_name="TechCorp").one_or_none() is None
#     #     assert self.session.query(Company).count() == 0
#     #     # assert self.session.query(CompanyCollege).count() == 0

    

#     # def test_create_and_link_person(self):
#     #     company = Company(company_name="TechCorp", role="Developer", ctc=60000.0)
#     #     college = College(college_name="Tech University")

#     #     self.session.add(company)
#     #     self.session.add(college)
#     #     self.session.commit()

#     #     Item(college=college, company=company).link(session=self.session)

#     #     company_college_relation = CompanyCollege.get(self.session, college, company)  # Assuming company is already created
#     #     assert company_college_relation is not None
        
#     #     person = Person(name="Alice Smith", email="alice@example.com")
#     #     self.session.add(person)
#     #     self.session.commit()
        
#     #     company_college_relation.update(person=person)
#     #     self.session.commit()
        
#     #     # Verify the relationship
#     #     assert company_college_relation.person == person

#     #     company_college_relation2 = CompanyCollege.get(self.session, college, company)  # Assuming company is already created
#     #     assert company_college_relation2 is not None
#     #     # Verify the relationship
#     #     assert company_college_relation2.person == person
        
#     # def test_create_and_link_person_directly(self):
#     #     company = Company(company_name="TechCorp", role="Developer", ctc=60000.0)
#     #     college = College(college_name="Tech University")

#     #     self.session.add(company)
#     #     self.session.add(college)
#     #     self.session.commit()
        
#     #     person = Person(name="Alice Smith", email="alice@example.com")
#     #     self.session.add(person)
#     #     self.session.commit()

#     #     Item(college=college, company=company).link(session=self.session, person=person)

#     #     company_college_relation = CompanyCollege.get(self.session, college, company)  # Assuming company is already created
#     #     assert company_college_relation is not None
        
#     #     # Verify the relationship
#     #     assert company_college_relation.person == person

#     #     company_college_relation2 = CompanyCollege.get(self.session, college, company)  # Assuming company is already created
#     #     assert company_college_relation2 is not None
#     #     # Verify the relationship
#     #     assert company_college_relation2.person == person
#     # def test_delete_manual_link_deletes_person(self):
#     #     company = Company(company_name="TechCorp", role="Developer", ctc=60000.0)
#     #     college = College(college_name="Tech University")

#     #     self.session.add(company)
#     #     self.session.add(college)
#     #     self.session.commit()

#     #     Item(college, company).link(self.session)

#     #     company_college_relation = CompanyCollege.get(self.session, college, company)  # Assuming company is already created
#     #     assert company_college_relation is not None
        
#     #     person = Person(name="Alice Smith", email="alice@example.com")
#     #     self.session.add(person)
#     #     self.session.commit()
        
#     #     company_college_relation.update(person)
#     #     self.session.commit()
        
#     #     self.session.delete(company_college_relation) 
#     #     self.session.commit()
#     #     assert self.session.query(Person).count() == 0
        
#     # def test_delete_link_deletes_person(self):
#     #     company = Company(company_name="TechCorp", role="Developer", ctc=60000.0)
#     #     college = College(college_name="Tech University")

#     #     self.session.add(company)
#     #     self.session.add(college)
#     #     self.session.commit()

#     #     Item(company=company, college=college).link(self.session)

#     #     company_college_relation = CompanyCollege.get(self.session, college, company)  # Assuming company is already created
#     #     assert company_college_relation is not None
        
#     #     person = Person(name="Alice Smith", email="alice@example.com")
#     #     self.session.add(person)
#     #     self.session.commit()
        
#     #     company_college_relation.update(person=person)
#     #     self.session.commit()
        
        
#     #     Item(company=company, college=college).unlink(self.session)
#     #     company_college_relation = CompanyCollege.get(self.session, college, company)  # Assuming company is already created
        
#     #     assert company_college_relation is None
#     #     self.session.commit()
#     #     assert self.session.query(CompanyCollege).count() == 0    
#     #     assert self.session.query(Person).count() == 0
        
#     #     assert self.session.query(College).count() == 0    
#     #     assert self.session.query(Company).count() == 0
   
#     # def test_delete_method_link_deletes_person(self):
#     #     company = Company(company_name="TechCorp", role="Developer", ctc=60000.0)
#     #     college = College(college_name="Tech University")

#     #     self.session.add(company)
#     #     self.session.add(college)
#     #     self.session.commit()

#     #     Item(company=company, college=college).link(self.session)

#     #     company_college_relation = CompanyCollege.get(self.session, college, company)  # Assuming company is already created
#     #     assert company_college_relation is not None
        
#     #     person = Person(name="Alice Smith", email="alice@example.com")
#     #     self.session.add(person)
#     #     self.session.commit()
        
#     #     company_college_relation.update(person)
#     #     self.session.commit()
#     #     assert self.session.query(Person).count() == 1
#     #     company.delete(self.session)
#     #     self.session.commit()
#     #     assert self.session.query(Company).count() == 0
#     #     self.session.commit()
#     #     assert self.session.query(College).count() + self.session.query(Person).count() == 0

