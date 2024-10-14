from typing import NewType, Union, List, Optional, Any, Tuple, Dict, NamedTuple

from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, UniqueConstraint, asc, desc, and_
from sqlalchemy.orm import relationship, declarative_base, Mapped
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import sessionmaker, Session, scoped_session
from sqlalchemy.exc import IntegrityError
from sqlalchemy.engine import Engine

# DEBUG Load environment variables from .env file
from dotenv import load_dotenv; load_dotenv()


SortBy = NewType("SortBy", str)
SortByOptions: Dict[str, SortBy] = {
    "college_name": SortBy("college_name"),
    "company_name": SortBy("company_name"),
    "role": SortBy("role"),
    "ctc": SortBy("ctc")
}
Order = NewType("Order", str)
OrderOptions: Dict[str, Order] = {
    "asc": Order("asc"),
    "desc": Order("desc")
}

Base: type = declarative_base()

# Association table for the many-to-many relationship
class CompanyCollege(Base):
    __tablename__ = 'company_college'
    company_id: Mapped[int] = Column(Integer, ForeignKey('companies.id'), primary_key=True)
    college_id: Mapped[int] = Column(Integer, ForeignKey('colleges.id'), primary_key=True)
    
    person_id: Mapped[Optional[int]] = Column(Integer, ForeignKey('persons.id'), nullable=True)
    person: Mapped[Optional["Person"]] = relationship("Person", uselist=False, cascade="all, delete-orphan", single_parent=True) # One-to-one relationship
    
    @staticmethod
    def get(session: scoped_session, company: "Company", college: "College") -> Optional["CompanyCollege"]:
        existing_relation: Optional[CompanyCollege] = session.query(CompanyCollege).filter_by(company_id=company.id, college_id=college.id).one_or_none()
        return existing_relation
    @staticmethod
    def create(session: scoped_session, company: "Company", college: "College", person: Optional["Person"]) -> "CompanyCollege":
        new_relation = CompanyCollege(company_id=company.id, college_id=college.id, person=person)
        session.add(new_relation)
        session.commit()  # Commit the new company to the database
        return new_relation
    @staticmethod
    def get_or_create(session: scoped_session, company: "Company", college: "College", person: Optional["Person"]) -> "CompanyCollege":
        existing_relation: Optional[Company] = CompanyCollege.get(session=session, company=company, college=college)
        if existing_relation: return existing_relation
        return CompanyCollege.create(session=session, company=company, college=college, person=person)
    def update(self, person: Optional["Person"]=None):
        if person is not None: self.person = person
    def __repr__(self) -> str: return f'<CompanyCollege({self.company_id}-{self.college_id}-{self.person_id})>'
    
class Person(Base):
    __tablename__ = 'persons'
    
    id: Mapped[int] = Column(Integer, primary_key=True)
    
    name: Mapped[Optional[str]] = Column(String, nullable=True)
    linkedin_id: Mapped[Optional[str]] = Column(String, nullable=True)
    email: Mapped[Optional[str]] = Column(String, nullable=True)
    contact_number: Mapped[Optional[str]] = Column(String, nullable=True)
    
    def __init__(self, name:Optional[str]=None, linkedin_id:Optional[str]=None, email:Optional[str]=None, contact_number:Optional[str]=None):
        if not any([name, linkedin_id, email, contact_number]): raise ValueError("At least one of 'name', 'linkedin_id', 'email', or 'contact_number' must be provided.")
        self.name = name
        self.linkedin_id = linkedin_id
        self.email = email
        self.contact_number = contact_number
    
    def __repr__(self) -> str: return f'<Person({self.name})>'
    
class Company(Base):
    __tablename__ = 'companies'
    
    id: Mapped[int] = Column(Integer, primary_key=True)
    company_name: Mapped[str] = Column(String, nullable=False)
    role: Mapped[str] = Column(String, nullable=False)
    ctc: Mapped[float] = Column(Float, nullable=False)

    __table_args__ = (
        UniqueConstraint('company_name', 'role', 'ctc', name='uix_company_role_ctc'),
    )

    # Relationship to colleges
    colleges: Mapped[List["College"]] = relationship("College", secondary="company_college", back_populates="companies", passive_deletes=True)
    
    @staticmethod
    def get(session: scoped_session, company_name: str, role: str, ctc: float) -> Optional["Company"]:
        existing_company: Optional[Company] = session.query(Company).filter_by(company_name=company_name, role=role, ctc=ctc).one_or_none()
        return existing_company
    @staticmethod
    def create(session: scoped_session, company_name: str, role: str, ctc: float) -> "Company":
        new_company = Company(company_name=company_name, role=role, ctc=ctc)
        session.add(new_company)
        session.commit()  # Commit the new company to the database
        return new_company
    @staticmethod
    def get_or_create(session: scoped_session, company_name: str, role: str, ctc: float) -> "Company":
        # Check if the company already exists
        existing_company: Optional[Company] = Company.get(session=session, company_name=company_name, role=role, ctc=ctc)
        if existing_company: return existing_company
        # If it doesn't exist, create a new company
        return Company.create(session=session, company_name=company_name, role=role, ctc=ctc)
    def update(self, company_name: Optional[str] = None, role: Optional[str] = None, ctc: Optional[float] = None):
        if company_name is not None: self.company_name = company_name
        if role is not None: self.role = role
        if ctc is not None: self.ctc = ctc

class College(Base):
    __tablename__ = 'colleges'
    
    id: Mapped[int] = Column(Integer, primary_key=True)
    college_name: Mapped[str] = Column(String, nullable=False, unique=True)

    # Relationship to companies
    companies: Mapped[List["Company"]] = relationship("Company", secondary="company_college", back_populates="colleges", passive_deletes=True)
    
    @staticmethod
    def get(session: scoped_session, college_name: str) -> Optional["College"]:
        existing_college: Optional[College] = session.query(College).filter_by(college_name=college_name).one_or_none()
        return existing_college
    @staticmethod
    def create(session: scoped_session, college_name: str) -> "College":
        new_College = College(college_name=college_name)
        session.add(new_College)
        session.commit()  # Commit the new college to the database
        return new_College
    @staticmethod
    def get_or_create(session: scoped_session, college_name: str) -> "College":
        # Check if the company already exists
        existing_college: Optional[College] = College.get(session=session, college_name=college_name)
        if existing_college: return existing_college
        # If it doesn't exist, create a new college
        return College.create(session=session, college_name=college_name)   
    def update(self, college_name: Optional[str] = None):
        if college_name is not None: self.college_name = college_name
        
class ItemPerson(NamedTuple):
    college: College
    company: Company
    person: Optional[Person] = None
        
class PostgreSQL:
    def __init__(self, db_url:str):
        self.db_url = db_url
        self.engine: Engine = create_engine(self.db_url)
        self.create_all()
        # self._session:Optional[Session] = None
        
        SessionFactory = sessionmaker(bind=self.engine)
        self.session: scoped_session = scoped_session(SessionFactory)
    
    def remove(self)->None: return self.session.remove()  
    def create_all(self):
        # Create the database and tables
        Base.metadata.create_all(self.engine)
    def delete_all(self):
        # delete all tables and create new tables 
        Base.metadata.drop_all(self.engine)
        self.create_all()
    def commit(self)->None: 
        try: self.session.commit()
        except IntegrityError as e:
            self.session.rollback()
            raise RuntimeError(f"Database integrity error: {e.orig}") from e

    # Function to add data
    def add_data(self, college_name:str, company_name:str, role:str, ctc:float, 
                 hr_name: Optional[str] = None, linkedin_id: Optional[str] = None, email: Optional[str] = None, contact_number: Optional[str] = None
        ):
        person: Optional[Person] = None
        if not (hr_name is None and linkedin_id is None and email is None and contact_number is None):
            person = Person(name=hr_name, email=email, linkedin_id=linkedin_id,contact_number=contact_number)
            self.session.add(person)
        
        new_company: Company = Company.get_or_create(session=self.session, company_name=company_name, role=role, ctc=ctc)
        new_college: College = College.get_or_create(session=self.session, college_name=college_name)
        assert new_college is not None and new_college is not None
        
        new_relation: CompanyCollege = CompanyCollege.get_or_create(session=self.session, college=new_college, company=new_company, person=person)

        self.session.commit()
        
        
    def fetch_all_companies(self)->List[Company]: return self.session.query(Company).all() 
    def fetch_all_colleges(self)->List[College]: return self.session.query(College).all()

    # Function to fetch all data
    def fetch_all_data(self)->List[ItemPerson]:
        results = (
            self.session.query(College, Company, Person)
                .select_from(CompanyCollege)
                .join(College, CompanyCollege.college_id == College.id)  # Explicit condition (may not needed)
                .join(Company, CompanyCollege.company_id == Company.id)  # Explicit condition (may not needed)
                .outerjoin(Person, CompanyCollege.person_id == Person.id)
                .all()
        )
        # Create a list of Item instances from the results
        items = [ItemPerson(college=college, company=company, person=person) for college, company, person in results]
        return items
    
    def fetch_all_data_sorted(self, sort_by:SortBy = SortByOptions["college_name"], order:Order = OrderOptions["asc"])->List[ItemPerson]:
        # Define valid columns to sort 
        valid_sort_columns = {
            SortByOptions["college_name"]: College.college_name,
            SortByOptions["company_name"]: Company.company_name,
            SortByOptions["role"]: Company.role,
            SortByOptions["ctc"]: Company.ctc
        }
        
        valid_sort_col = valid_sort_columns.get(sort_by)
        if valid_sort_col is None: raise ValueError(f"Invalid sort column specified. Must be an instance of SortBy enum not {sort_by}.")
            
        # Construct the query
        query = (
            self.session.query(College, Company, Person)
                .select_from(CompanyCollege)
                .join(College, CompanyCollege.college_id == College.id)  # Explicit condition (may not needed)
                .join(Company, CompanyCollege.company_id == Company.id)  # Explicit condition (may not needed)
                .outerjoin(Person, CompanyCollege.person_id == Person.id)
        )
        
        # Apply sorting
        if order == OrderOptions["asc"]: query = query.order_by(asc(valid_sort_col))
        elif order == OrderOptions["desc"]: query = query.order_by(desc(valid_sort_col))
        else: raise ValueError(f"Invalid order column specified. Must be an instance of Order enum not {order}.")

        results = query.all()
        # Create a list of Item instances from the results
        items = [ItemPerson(college=college, company=company, person=person) for college, company, person in results]
        return items
    
    def search_by_college(self, college_name:str) -> List[ItemPerson]:
        results = (
            self.session.query(College, Company, Person)
                .select_from(CompanyCollege)
                .join(College, CompanyCollege.college_id == College.id)  # Explicit condition (may not needed)
                .join(Company, CompanyCollege.company_id == Company.id)  # Explicit condition (may not needed)
                .outerjoin(Person, CompanyCollege.person_id == Person.id)
                .filter(College.college_name.ilike(f"%{college_name}%"))  # Case-insensitive search and This uses wildcards (%) to match any substring within the college_name.
                .all()
        )
        # Create a list of Item instances from the results
        items = [ItemPerson(college=college, company=company, person=person) for college, company, person in results]
        return items
    def search_by_company(self, company_name:str) -> List[ItemPerson]:
        results = (
            self.session.query(College, Company, Person)
                .select_from(CompanyCollege)
                .join(College, CompanyCollege.college_id == College.id)  # Explicit condition (may not needed)
                .join(Company, CompanyCollege.company_id == Company.id)  # Explicit condition (may not needed)
                .outerjoin(Person, CompanyCollege.person_id == Person.id)
                .filter(Company.company_name.ilike(company_name))  # Case-insensitive search
                .all()
        )
        # Create a list of Item instances from the results
        items = [ItemPerson(college=college, company=company, person=person) for college, company, person in results]
        return items
    def search_by_role(self, role:str) -> List[ItemPerson]:
        results = (
            self.session.query(College, Company, Person)
                .select_from(CompanyCollege)
                .join(College, CompanyCollege.college_id == College.id)  # Explicit condition (may not needed)
                .join(Company, CompanyCollege.company_id == Company.id)  # Explicit condition (may not needed)
                .outerjoin(Person, CompanyCollege.person_id == Person.id)
                .filter(Company.role.ilike(role))  # Case-insensitive search
                .all()
        )
        # Create a list of Item instances from the results
        items = [ItemPerson(college=college, company=company, person=person) for college, company, person in results]
        return items
    def search_with_filters(self, college_name: Optional[str] = None, company_name: Optional[str] = None, role: Optional[str] = None) -> List[ItemPerson]:
        query = (
            self.session.query(College, Company, Person)
                .select_from(CompanyCollege)
                .join(College, CompanyCollege.college_id == College.id)  # Explicit condition (may not needed)
                .join(Company, CompanyCollege.company_id == Company.id)
                .outerjoin(Person, CompanyCollege.person_id == Person.id)
        )

        # Build filters
        filters = []

        if college_name: filters.append(College.college_name.ilike(college_name))  # Case-insensitive search
        if company_name: filters.append(Company.company_name.ilike(company_name))  # Case-insensitive search
        if role: filters.append(Company.role.ilike(role))  # Case-insensitive search

        # Apply filters if any exist
        if filters: query = query.filter(and_(*filters))

        results = query.all()
        # Create a list of Item instances from the results
        items = [ItemPerson(college=college, company=company, person=person) for college, company, person in results]
        return items
