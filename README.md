# Even Split 💸

A full-stack expense management web application inspired by Splitwise, designed to help users track shared expenses, manage group spending, and settle balances efficiently.

---

## 🚀 Features

* 👥 User authentication (JWT-based login & register)
* 💰 Add, split, and track expenses
* 📊 View balances and transaction history
* 👨‍👩‍👧 Group-based expense management
* 🔐 Secure backend with validation
* 🌐 Fully deployed on cloud

---

## 🛠️ Tech Stack

* **Frontend:** React.js (Vite)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas
* **Authentication:** JWT (JSON Web Tokens)
* **Cloud:** AWS EC2 (Backend), AWS S3 (Frontend)
* **Process Manager:** PM2

---

## ☁️ Cloud Deployment

* Frontend is hosted on AWS S3 as a static website
* Backend is deployed on AWS EC2 instance
* Database is managed using MongoDB Atlas
* Backend runs continuously using PM2

---

## 🔗 Live Demo

👉 Frontend: http://even-split-frontend.s3-website-ap-south-1.amazonaws.com
👉 Backend API: http://35.154.240.59:5000

---

## 📌 How It Works

1. User accesses the frontend hosted on S3
2. Frontend sends API requests to backend on EC2
3. Backend processes requests and interacts with MongoDB Atlas
4. Data is returned and displayed on the frontend

---

## 📈 Future Improvements

* Add payment integration
* Real-time notifications
* Mobile app support
* Load balancing & scaling

---

## ⭐ Notes

This project demonstrates a real-world MERN stack application deployed on cloud infrastructure using AWS services.

---
