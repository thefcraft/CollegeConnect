from constants import HOST, DATABASE_URL, PORT, DEBUG
import io, os
import pandas as pd
from enum import Enum
from urllib.parse import urlparse
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import NewType, Union, List, Optional, Any, Tuple, Dict, NamedTuple
from models import (
    PostgreSQL, College, Company, CompanyCollege, SortBy, SortByOptions, Order, OrderOptions, ItemPerson, 
    AnalyticsSummary, TopListItem, TopCtcItem
)

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from werkzeug.exceptions import BadRequest

db = PostgreSQL(DATABASE_URL)
app = Flask(__name__)
CORS(app)

def get_dict_from_item(idx: int, item: ItemPerson):
    return {
        "id": idx,
        "college_name": item.college.college_name, 
        "company_name": item.company.company_name,
        "role": item.company.role,
        "ctc": item.company.ctc,
        "hr_name" : item.person.name if item.person is not None else None,
        "linkedin_id" : item.person.linkedin_id if item.person is not None else None,
        "email" : item.person.email if item.person is not None else None,
        "contact_number" :  item.person.contact_number if item.person is not None else None,
    }
    
@app.route('/companies', methods=['GET'])
def get_companies():
    try:
        companies = db.fetch_all_companies()
        # db.close()
        return jsonify([{
            "id": company.id,
            "company_name": company.company_name,
            "role": company.role,
            "ctc": company.ctc
        } for company in companies])
    except Exception as e: return {"error": str(e)}, 500
    finally: db.remove()

@app.route('/colleges', methods=['GET'])
def get_colleges():
    try:
        colleges = db.fetch_all_colleges()
        return jsonify([{
            "id": college.id,
            "college_name": college.college_name
        } for college in colleges])
    except Exception as e: return {"error": str(e)}, 500
    finally: db.remove()
    
@app.route('/view', methods=['POST'])
def get_view_data():
    try:
        data = request.json
        sort_by = SortByOptions.get(data.get('sort_by'))
        if sort_by is None: items = db.fetch_all_data()
        else: items = db.fetch_all_data_sorted(sort_by=sort_by)
        return jsonify([get_dict_from_item(idx, item) for idx, item in enumerate(items)])
    except Exception as e: return {"error": str(e)}, 500
    finally: db.remove()

@app.route('/download', methods=['GET'])
def download():
    try:
        items = db.fetch_all_data()
        data = [get_dict_from_item(idx, item) for idx, item in enumerate(items)]
        df = pd.DataFrame(data)
        buffer = io.BytesIO()
        df.to_csv(buffer, index=False)
        buffer.seek(0)
        download_name = f"data_export_{pd.Timestamp.now().strftime('%Y-%m-%d_%H-%M-%S')}.csv"
        return send_file(buffer, as_attachment=True, download_name=download_name, mimetype='text/csv')
    except Exception as e: return {"error": str(e)}, 500
    finally: db.remove()

@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.json
        college_name = data.get('college_name')
        company_name = data.get('company_name')
        role = data.get('role')
        non_none_count = sum(var is not None for var in (college_name, company_name, role))
        if non_none_count == 0: return jsonify([])
        if non_none_count == 1:
            if college_name is not None: 
                items = db.search_by_college(college_name=college_name)
            elif company_name is not None: 
                items = db.search_by_company(company_name=company_name)
            else:  # elif role is not None:
                items = db.search_by_role(role=role)
        else:
            items = db.search_with_filters(college_name=college_name, company_name=company_name, role=role)

        return jsonify([get_dict_from_item(idx, item) for idx, item in enumerate(items)])
    except Exception as e: return {"error": str(e)}, 500
    finally: db.remove()
@app.route('/add', methods=['POST'])
def add_data():
    try:
        data = request.json

        college_name = data.get('college_name')
        company_name = data.get('company_name')
        role = data.get('role')
        ctc = data.get('ctc')
        
        hr_name = data.get('hr_name')
        linkedin_id = data.get('linkedin_id')
        email = data.get('email')
        contact_number = data.get('contact_number')

        if company_name is None or role is None or ctc is None or college_name is None:
            raise BadRequest("Missing required fields in request data")
        try: ctc = float(ctc)
        except Exception as e: raise BadRequest("ctc must be real")

        db.add_data(college_name=college_name,
                    company_name=company_name,
                    role=role,
                    ctc=ctc, hr_name=hr_name, email=email, contact_number=contact_number, linkedin_id=linkedin_id)
        db.commit()
        return jsonify({"message": "Data added successfully!"}), 201
    except Exception as e: return {"error": str(e)}, 500
    finally: db.remove()

@app.route('/upload-csv', methods=['POST'])
def upload_csv():
    try:
        if 'file' not in request.files: return jsonify({"message": "No file part"}), 400
        file = request.files['file']
        if file.filename == '': return jsonify({"message": "No selected file"}), 400
        if file and file.filename.endswith('.csv'):
            # Use pandas to read the CSV file directly from the file object
            try:
                df = pd.read_csv(file)  # , index_col=0
                required_columns = ['college_name', 'company_name', 'role', 'ctc', 'hr_name', 'linkedin_id', 'email', 'contact_number']
                missing_columns = [col for col in required_columns if col not in df.columns]
                if missing_columns: 
                    return jsonify({"message": "Missing columns: " + ", ".join(missing_columns)}), 400
                for i in range(0, len(df)):
                    c =  df.iloc[i]
                    (college_name, company_name, role, ctc, 
                     hr_name, linkedin_id, email, contact_number) = (c["college_name"], c["company_name"], c["role"], c["ctc"],
                                                                     c["hr_name"], c["linkedin_id"], c["email"], c["contact_number"])
                    
                    db.add_data(college_name=str(college_name),
                                company_name=str(company_name),
                                role=str(role),
                                ctc=float(ctc),
                                hr_name=(str(hr_name) if not pd.isna(hr_name) else None),
                                linkedin_id=(str(linkedin_id) if not pd.isna(linkedin_id) else None),
                                email=(str(email) if not pd.isna(email) else None),
                                contact_number=(str(contact_number) if not pd.isna(contact_number) else None)
                    )
                db.commit()
                return jsonify({"message": "File uploaded successfully!"}), 201
            except Exception as e:
                return jsonify({"message": f"Error processing the file: {str(e)}"}), 400
        return jsonify({"message": "Invalid file type. Only CSV files are allowed."}), 400
    except Exception as e: return {"error": str(e)}, 500
    finally: db.remove()

@app.route('/edit-college-company', methods=['POST'])
def edit_college_company():
    try:
        # first delete then add new entry...
        data = request.json
        old_college_name = data.get('old_college_name')
        old_company_name = data.get('old_company_name')
        old_role = data.get('old_role')
        old_ctc = data.get('old_ctc')


        if old_college_name is None or old_role is None or old_ctc is None or old_company_name is None:
            raise BadRequest("Missing required fields in request data")
        try: old_ctc = float(old_ctc)
        except Exception as e: raise BadRequest("ctc must be real")

        new_college_name = data.get('new_college_name', old_college_name)
        new_company_name = data.get('new_company_name', old_company_name)
        new_role = data.get('new_role', old_role)
        new_ctc = data.get('new_ctc', old_ctc)
        try: new_ctc = float(new_ctc)
        except Exception as e: raise BadRequest("ctc must be real")
        
        new_hr_name = data.get('new_hr_name')
        new_linkedin_id = data.get('new_linkedin_id')
        new_email = data.get('new_email')
        new_contact_number = data.get('new_contact_number')

        college = College.get(db.session, college_name=old_college_name)
        company = Company.get(db.session, company_name=old_company_name, role=old_role, ctc=old_ctc)
        if college is None or company is None: raise BadRequest("Data not found...")

        college.companies.remove(company)
        if len(college.companies) == 0: db.session.delete(college)
        if len(company.colleges) == 0: db.session.delete(company)

        db.add_data(college_name=new_college_name, company_name=new_company_name, role=new_role, ctc=new_ctc,
                    hr_name=new_hr_name, email=new_email, contact_number=new_contact_number, linkedin_id=new_linkedin_id)

        db.commit()
        return jsonify({"message": "Data successfully deleted!"}), 201
    except Exception as e: return {"error": str(e)}, 500
    finally: db.remove()

@app.route('/delete-college-company', methods=['POST'])
def delete_college_company():
    try:
        data = request.json
        college_name = data.get('college_name')
        company_name = data.get('company_name')
        role = data.get('role')
        ctc = data.get('ctc')

        if company_name is None or role is None or ctc is None or college_name is None:
            raise BadRequest("Missing required fields in request data")
        try: ctc = float(ctc)
        except Exception as e: raise BadRequest("ctc must be real")

        college = College.get(db.session, college_name=college_name)
        company = Company.get(db.session, company_name=company_name, role=role, ctc=ctc)
        if college is None or company is None: raise BadRequest("Data not found...")

        college.companies.remove(company)
        if len(college.companies) == 0: db.session.delete(college)
        if len(company.colleges) == 0: db.session.delete(company)

        db.commit()

        return jsonify({"message": "Data successfully deleted!"}), 201
    except Exception as e: return {"error": str(e)}, 500
    finally: db.remove()

@app.route('/analytics', methods=['GET'])
def get_analytics():
    """
    Provides various analytics data.
    Accepts optional query parameter 'n' for top lists (default 5).
    """
    try:
        # Get 'n' from query parameters, default to 5 if not provided or invalid
        try:
            n = int(request.args.get('n', 5))
            if n <= 0: n = 5
        except ValueError:
            n = 5

        summary = db.get_analytics_summary()
        top_companies_visits = db.get_top_companies_by_visits(n)
        top_colleges_visits = db.get_top_colleges_by_visits(n)
        top_placements_ctc = db.get_top_placements_by_ctc(n)

        # Convert NamedTuples to dictionaries for JSON serialization
        analytics_data = {
            "summary": summary._asdict(),
            f"top_{n}_companies_by_visits": [item._asdict() for item in top_companies_visits],
            f"top_{n}_colleges_by_visits": [item._asdict() for item in top_colleges_visits],
            f"top_{n}_placements_by_ctc": [item._asdict() for item in top_placements_ctc],
        }

        return jsonify(analytics_data)

    except Exception as e:
        # Log the exception details here if needed
        print(f"Error in /analytics: {e}") # Basic logging
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500
    finally:
        db.remove()

# Add more routes for updating, deleting, and searching...

if __name__ == '__main__':
    app.run(debug=DEBUG, host=HOST, port=PORT)