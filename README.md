# SARGEN - AI-Powered Suspicious Activity Report Generation

A full-stack web application that automates the generation of regulatory Suspicious Activity Reports (SARs) using AI and machine learning to analyze financial transaction data.
<img width="1880" height="849" alt="image" src="https://github.com/user-attachments/assets/2d137908-79e6-4195-9b45-0e68800bd82b" />

## Features

- **AI-Powered Report Generation**: Automatically generate SAR narratives from transaction patterns
- **Pattern Detection**: Identify suspicious activities like structuring, layering, and round amounts
- **Interactive Dashboard**: Case management and investigation workflow
- **Compliance Validation**: Ensure reports meet regulatory requirements
- **Secure Authentication**: Role-based access for compliance officers
<img width="1894" height="849" alt="image" src="https://github.com/user-attachments/assets/ae85a146-a719-4348-b5fc-606be0e7edbe" />


## Architecture

- **Frontend**: React with TypeScript, Material-UI components
- **Backend**: Python FastAPI with async support
- **AI/ML**: OpenAI GPT integration with custom fine-tuning
- **Database**: PostgreSQL for transaction data and reports
- **Security**: JWT authentication with role-based permissions

  
- **Interactive Dashboard**: Case management and investigation workflow

<img width="1896" height="866" alt="image" src="https://github.com/user-attachments/assets/35ced36d-552c-4eab-8ddc-118fc4beb9aa" />


- **AI COPILOT CHATBOT FOR ASSISTANCE**: Ask any questions related to cases .

<img width="1878" height="808" alt="image" src="https://github.com/user-attachments/assets/4ff92516-3842-4862-9c98-8dfcab49af57" />


<img width="1864" height="743" alt="image" src="https://github.com/user-attachments/assets/31b35e2a-c845-4087-b712-ebfc99cb9b94" />

## Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup  
```bash
cd frontend
npm install
npm start
```

## Project Structure

```
sargen/
├── backend/           # FastAPI server
├── frontend/          # React application  
├── ai/               # ML models and pattern detection
├── data/             # Sample datasets and schemas
├── docs/             # Documentation
└── tests/            # Test suites
```

## Development

1. Set up virtual environment for Python backend
2. Install Node.js dependencies for frontend
3. Configure environment variables
4. Run development servers
5. Access application at http://localhost:3000

## License

MIT License - see LICENSE file for details.
