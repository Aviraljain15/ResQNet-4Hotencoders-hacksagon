# 🌐 ResQNet – AI-Powered Disaster Response System

ResQNet is an intelligent disaster management platform designed to bridge the gap between citizens and authorities by enabling real-time disaster reporting, AI-based analysis, and efficient response coordination.

---

## 🚀 Features

### 👤 Citizen Module

* Report disasters in real-time
* Input:

  * 📍 Location (auto/manual)
  * ⚠️ Disaster type
  * 📝 Description
  * 📸 Image upload (optional)
* Simple and fast reporting interface

### 🏢 Authority Dashboard

* View incoming disaster reports
* Categorized and prioritized incidents
* Real-time updates
* Decision-support interface for quick action

### 🤖 AI Integration

* Multiple trained ML models:

  * Image classification (disaster detection)
  * Severity prediction
  * Data processing & filtering
* Helps reduce false reports and prioritize emergencies

### 🌍 Map & Location Intelligence

* Uses geolocation (latitude/longitude)
* Converts coordinates into usable location data
* Helps authorities visualize disaster zones

---

## 🧠 Problem It Solves

Traditional disaster response systems suffer from:

* Delayed reporting
* Lack of real-time data
* Poor coordination between citizens and authorities

**ResQNet solves this by:**

* Enabling instant reporting
* Using AI for smarter decision-making
* Providing a centralized monitoring system

---

## 🛠️ Tech Stack

### Frontend

* HTML / CSS / JavaScript
* react
* typescript

### Backend

* FastAPI (Python)
* REST APIs for communication

### Machine Learning

* TensorFlow
* OpenCV
* NumPy
* Joblib

### Database & Services

* Firebase (database / Auth)
* cloudinary(Storage )

---

## ⚙️ How to Run the Project

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Aviraljain15/ResQNet-4Hotencoders-hacksagon.git
cd ResQNet-4Hotencoders-hacksagon
```

### 2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### 3️⃣ Run FastAPI Server

```bash
uvicorn app:app --reload
```

API will run at:

```
http://127.0.0.1:8000
```

---

### 4️⃣ Frontend Setup

```bash
cd frontend
```

* Open `index.html`
  **OR**

```bash
npm install
npm start
```

---

### 5️⃣ Test API

* Open browser:

```
http://127.0.0.1:8000/docs
```

* Or use Postman

---

## 📊 Project Workflow

1. User reports disaster
2. Data sent to backend
3. AI models analyze input
4. Data stored & processed
5. Authorities view dashboard
6. Action taken

---

## 📸 Screenshots

*Add your UI screenshots here (Dashboard, Reporting Page, etc.)*

---

## 📌 Future Improvements

* 🔔 Real-time alert notifications
* 📱 Mobile app integration
* 🛰️ Satellite data integration
* 🧭 Advanced predictive analytics
* 🔗 Government API integration (NDMA/DDMA)

---

## 👥 Team

* Aviral Jain
* Ajay newriwal 
* abhinav gupta
* akshat sharma

---

## 🏁 Conclusion

ResQNet aims to make disaster response:

* Faster ⚡
* Smarter 🧠
* More reliable 🌍

---

## 📄 License

This project is for educational and hackathon purposes.

---

⭐ If you like this project, give it a star!

