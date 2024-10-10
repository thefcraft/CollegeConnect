# CollegeConnect

CollegeConnect is a web application that allows users to manage and search for college and company data. It features a RESTful API built with Flask and a frontend developed with Next.js, enabling users to easily interact with the data.

## Features

- **View Companies**: Fetch a list of companies with their roles and CTC.
- **View Colleges**: Retrieve a list of colleges.
- **Search Functionality**: Search for entries based on college name, company name, or role.
- **Add Data**: Add new college and company data to the database.
- **Edit Data**: Modify existing entries in the database.
- **Delete Data**: Remove specific college and company records.
- **Upload CSV**: Import data from a CSV file into the database.
- **Download Data**: Export the entire dataset as a CSV file.
- **Sorting Options**: Sort entries based on various criteria.

## Tech Stack

- **Backend**: Flask
- **Frontend**: Next.js
- **Database**: PostgreSQL (or any other database you choose)

## API Endpoints

### GET /companies
Retrieve a list of all companies.

### GET /colleges
Retrieve a list of all colleges.

### POST /view
Get data based on sorting criteria.

### GET /download
Download the dataset as a CSV file.

### POST /search
Search for entries based on college name, company name, or role.

### POST /add
Add a new college-company entry.

### POST /upload-csv
Upload a CSV file to populate the database.

### POST /edit-college-company
Edit an existing college-company entry.

### POST /delete-college-company
Delete a specific college-company entry.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/thefcraft/CollegeConnect.git
   cd CollegeConnect
   ```

2. Set up the backend:
   - Navigate to the backend directory and install the required packages:
     ```bash
     cd backend
     pip install -r requirements.txt
     ```

3. Set up the frontend:
   - Navigate to the frontend directory and install the required packages:
     ```bash
     cd frontend
     npm install
     ```

4. Run the backend:
   ```bash
   python api.py 
   ```

5. Run the frontend:
   ```bash
   npx next dev -H 0.0.0.0 -p 3000
   ```

6. Access the application:
   - Frontend: [http://127.0.0.1:3000](http://127.0.0.1:3000)
   - API: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## Usage

- Use the frontend interface to interact with the API and manage your data.
- You can use tools like Postman to test the API endpoints directly.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.