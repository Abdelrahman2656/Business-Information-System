# 🏢 Business Information System

## 🌐 Live Website
Access the live project here: [bis-hti.web.app](https://bis-hti.web.app/)

## View Counter
![Visitors](https://visitor-badge.laobi.icu/badge?page_id=BusinessInformationSystem)

## 📋 Project Overview
This project is a Business Information System built using Node.js and Express.js. The system provides an API for managing students and educational courses.

## 📚 API Documentation
For detailed API documentation and testing, visit our Postman collection:
[API Documentation](https://documenter.getpostman.com/view/29989813/2sB2cUCPRb)

### API Features
- 🔐 Secure Authentication System
- 👨‍🎓 Student Management
- 📚 Course Management
- 📧 Email Notifications
- 🔄 Real-time Updates

### API Endpoints Structure
```
/api/v1/
├── /auth
│   ├── /register
│   ├── /login
│   └── /verify-email
├── /students
│   ├── GET / (List all students)
│   ├── POST / (Create student)
│   ├── GET /:id (Get student details)
│   └── PUT /:id (Update student)
└── /courses
    ├── GET / (List all courses)
    ├── POST / (Create course)
    ├── GET /:id (Get course details)
    └── PUT /:id (Update course)
```

## ✨ Key Features
- 👨‍🎓 Student Management
- 📚 Course Management
- 🛡️ Advanced Security with Helmet
- ⏱️ Rate Limiting System
- ⚠️ Global Error Handling
- 🔄 CORS Support
- 💾 Database Integration

## 🛠️ Technologies Used
- ⚡ Node.js
- 🚀 Express.js
- 🍃 MongoDB (Database)
- 🛡️ Helmet (Security)
- 🔄 CORS
- 🔑 dotenv (Environment Variables)

## 📁 Project Structure
```
Src/
├── app.controller.js    # Main Application File
├── Modules/            # Application Modules (Students & Courses)
├── Middleware/         # Middleware
├── Utils/             # Utility Tools
└── Database/          # Database Files
```

## 🚀 How to Run
1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file and add required environment variables:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
USER_SEND=your_email
USER_PASS=your_email_password
```

3. Run the application:
```bash
npm start
```

## 🔌 Endpoints
- `/api/v1` - Student endpoints
- `/api/v1/course` - Course endpoints

## 🔒 Security
- 🛡️ Helmet for application security
- ⏱️ Rate limiting to prevent attacks
- ⚠️ Global error handling
- 🔄 CORS support

## 📧 Contact
For inquiries or support:
- 📧 Email: a.elmonged870@gmail.com

## 📜 License
All rights reserved © 2024 
