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
    "asc": SortBy("asc"),
    "desc": SortBy("desc")
}

Base = declarative_base()

# Association table for the many-to-many relationship
class CompanyCollege(Base):
    __tablename__ = 'company_college'
    company_id: Mapped[int] = Column(Integer, ForeignKey('companies.id'), primary_key=True)
    college_id: Mapped[int] = Column(Integer, ForeignKey('colleges.id'), primary_key=True)
    
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
    colleges: Mapped[List["College"]] = relationship("College", secondary="company_college", back_populates="companies") # , cascade="all, delete-orphan")
    
    @staticmethod
    def get(session: Session, company_name: str, role: str, ctc: float) -> Optional["Company"]:
        existing_company: Optional[Company] = session.query(Company).filter_by(company_name=company_name, role=role, ctc=ctc).one_or_none()
        return existing_company
        
    
    @staticmethod
    def get_or_create(session: Session, company_name: str, role: str, ctc: float) -> "Company":
        # Check if the company already exists
        existing_company: Optional[Company] = session.query(Company).filter_by(company_name=company_name, role=role, ctc=ctc).first()
        
        if existing_company:
            # If it exists, return the existing company
            print("The company already exists. Skipping...")
            return existing_company
        else:
            # If it doesn't exist, create a new company
            new_company = Company(company_name=company_name, role=role, ctc=ctc)
            session.add(new_company)
            session.commit()  # Commit the new company to the database
            return new_company
    
    def link_college(self, college: "College"):
        if self not in college.companies: college.companies.append(self)
        else: print("The relationship already exists between the company and college. Skipping...")
    def unlink_college(self, college: "College"):
        if self in college.companies: college.companies.remove(self) # Remove the relationship
        else: print("The relationship never exists between the company and college. Skipping...")
        
            
    def update(self, company_name: Optional[str] = None, role: Optional[str] = None, ctc: Optional[float] = None):
        if company_name is not None: self.company_name = company_name
        if role is not None: self.role = role
        if ctc is not None: self.ctc = ctc
    
    def delete(self, session: Session):
        # Remove the company from associated colleges
        for college in self.colleges:
            college.companies.remove(self)  
        session.delete(self)  # Now delete the company itself

class College(Base):
    __tablename__ = 'colleges'
    
    id: Mapped[int] = Column(Integer, primary_key=True)
    college_name: Mapped[str] = Column(String, nullable=False, unique=True)

    # Relationship to companies
    companies: Mapped[List["Company"]] = relationship("Company", secondary="company_college", back_populates="colleges") # , cascade="all, delete-orphan")
    
    @staticmethod
    def get(session: Session, college_name: str) -> Optional["College"]:
        existing_college: Optional[College] = session.query(College).filter_by(college_name=college_name).one_or_none()
        return existing_college
    
    @staticmethod
    def get_or_create(session: Session, college_name: str) -> "College":
        # Check if the company already exists
        existing_college: Optional[College] = session.query(College).filter_by(college_name=college_name).first()
        
        if existing_college:
            # If it exists, return the existing college
            print("The college already exists. Skipping...")
            return existing_college
        else:
            # If it doesn't exist, create a new college
            new_College = College(college_name=college_name)
            session.add(new_College)
            session.commit()  # Commit the new college to the database
            return new_College

    def link_company(self, company: "Company"):
        if self not in company.colleges: company.colleges.append(self)
        else: print("The relationship already exists between the company and college. Skipping...")
    def unlink_company(self, company: "Company"):
        if self in company.colleges: company.colleges.remove(self) # Remove the relationship
        else: print("The relationship never exists between the company and college. Skipping...")
            
    def update(self, college_name: Optional[str] = None):
        if college_name is not None: self.college_name = college_name
        
    def delete(self, session: Session):
        # Remove the colleges from associated company
        for company in self.companies:
            company.colleges.remove(self)  # Remove the relationship
        session.delete(self)  # Now delete the college itself

class Item(NamedTuple):
    college: College
    company: Company
    def link(self): self.college.link_company(self.company)
    def unlink(self): self.college.unlink_company(self.company)

class PostgreSQL:
    def __init__(self, db_url:str):
        self.db_url = db_url
        self.engine: Engine = create_engine(self.db_url)
        Base.metadata.create_all(self.engine)
        # self._session:Optional[Session] = None
        
        SessionFactory = sessionmaker(bind=self.engine)
        self.db_session: scoped_session = scoped_session(SessionFactory)
    
    def remove(self)->None: return self.session.remove()
    
    @property
    def session(self) -> scoped_session:
        return self.db_session
        # if self._session is None: self.connect()
        # return self._session
    # Database setup
    # def connect(self)->None: 
        # if self._session is not None: return print("already connected. Skipping...")
        # self._session = sessionmaker(bind=self.engine)()
    # def close(self)->None: self.session.close()
    
    
    def commit(self)->None: 
        try: self.session.commit()
        except IntegrityError as e:
            self.session.rollback()
            raise RuntimeError(f"Database integrity error: {e.orig}") from e

    # Function to add data
    def add_data(self, college_name:str, company_name:str, role:str, ctc:float):
        new_company = Company.get_or_create(session=self.session, company_name=company_name, role=role, ctc=ctc)
        new_college = College.get_or_create(session=self.session, college_name=college_name)
        
        # Establish the relationship
        new_company.link_college(new_college)
        
        self.session.add(new_company)
        
    def fetch_all_companies(self)->List[Company]: return self.session.query(Company).all() 
    def fetch_all_colleges(self)->List[College]: return self.session.query(College).all()

    # Function to fetch all data
    def fetch_all_data(self)->List[Item]:
        results = (
            self.session.query(College, Company)
                .select_from(CompanyCollege)
                .join(College, CompanyCollege.college_id == College.id)  # Explicit condition (may not needed)
                .join(Company, CompanyCollege.company_id == Company.id)  # Explicit condition (may not needed)
                .all()
        )
        # Create a list of Item instances from the results
        items = [Item(college=college, company=company) for college, company in results]
        return items
    
    def fetch_all_data_sorted(self, sort_by:SortBy = SortByOptions["college_name"], order:Order = OrderOptions["asc"])->List[Item]:
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
            self.session.query(College, Company)
                .select_from(CompanyCollege)
                .join(College, CompanyCollege.college_id == College.id)  # Explicit condition (may not needed)
                .join(Company, CompanyCollege.company_id == Company.id)  # Explicit condition (may not needed)
        )
        
        # Apply sorting
        if order == OrderOptions["asc"]: query = query.order_by(asc(valid_sort_col))
        elif order == OrderOptions["desc"]: query = query.order_by(desc(valid_sort_col))
        else: raise ValueError(f"Invalid order column specified. Must be an instance of Order enum not {order}.")

        results = query.all()
        # Create a list of Item instances from the results
        items = [Item(college=college, company=company) for college, company in results]
        return items
    
    def search_by_college(self, college_name:str) -> List[Item]:
        results = (
            self.session.query(College, Company)
                .select_from(CompanyCollege)
                .join(College, CompanyCollege.college_id == College.id)  # Explicit condition (may not needed)
                .join(Company, CompanyCollege.company_id == Company.id)  # Explicit condition (may not needed)
                .filter(College.college_name.ilike(f"%{college_name}%"))  # Case-insensitive search and This uses wildcards (%) to match any substring within the college_name.
                .all()
        )
        # Create a list of Item instances from the results
        items = [Item(college=college, company=company) for college, company in results]
        return items
    def search_by_company(self, company_name:str) -> List[Item]:
        results = (
            self.session.query(College, Company)
                .select_from(CompanyCollege)
                .join(College, CompanyCollege.college_id == College.id)  # Explicit condition (may not needed)
                .join(Company, CompanyCollege.company_id == Company.id)  # Explicit condition (may not needed)
                .filter(Company.company_name.ilike(company_name))  # Case-insensitive search
                .all()
        )
        # Create a list of Item instances from the results
        items = [Item(college=college, company=company) for college, company in results]
        return items
    def search_by_role(self, role:str) -> List[Item]:
        results = (
            self.session.query(College, Company)
                .select_from(CompanyCollege)
                .join(College, CompanyCollege.college_id == College.id)  # Explicit condition (may not needed)
                .join(Company, CompanyCollege.company_id == Company.id)  # Explicit condition (may not needed)
                .filter(Company.role.ilike(role))  # Case-insensitive search
                .all()
        )
        # Create a list of Item instances from the results
        items = [Item(college=college, company=company) for college, company in results]
        return items
    def search_with_filters(self, college_name: Optional[str] = None, company_name: Optional[str] = None, role: Optional[str] = None) -> List[Item]:
        query = (
            self.session.query(College, Company)
                .select_from(CompanyCollege)
                .join(College, CompanyCollege.college_id == College.id)  # Explicit condition (may not needed)
                .join(Company, CompanyCollege.company_id == Company.id)
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
        items = [Item(college=college, company=company) for college, company in results]
        return items
