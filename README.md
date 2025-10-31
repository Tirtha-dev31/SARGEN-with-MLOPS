# SARGEN - AI-Powered Suspicious Activity Report Generation

A full-stack web application that automates the generation of regulatory Suspicious Activity Reports (SARs) using AI and machine learning to analyze financial transaction data.

## Features

- **AI-Powered Report Generation**: Automatically generate SAR narratives from transaction patterns
- **Pattern Detection**: Identify suspicious activities like structuring, layering, and round amounts
- **Interactive Dashboard**: Case management and investigation workflow
- **Compliance Validation**: Ensure reports meet regulatory requirements
- **Secure Authentication**: Role-based access for compliance officers

## Architecture

- **Frontend**: React with TypeScript, Material-UI components
- **Backend**: Python FastAPI with async support
- **AI/ML**: OpenAI GPT integration with custom fine-tuning
- **Database**: PostgreSQL for transaction data and reports
- **Security**: JWT authentication with role-based permissions

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