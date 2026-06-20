# 💰 Cashier App

A modern cashier and point-of-sale (POS) application built with React, TypeScript, Vite, and Tailwind CSS. The application provides transaction management, QR code support, reporting dashboards, and data export capabilities.

## 🚀 Features

### 🛒 Transaction Management

* Create and manage sales transactions
* Calculate totals automatically
* Fast checkout workflow

### 📱 QR Code Integration

* Generate QR codes
* Scan QR codes using camera
* Product identification through QR scanning

### 📊 Analytics Dashboard

* Interactive sales charts
* Revenue monitoring
* Business performance visualization

### 📄 Export & Reporting

* Export reports to PDF
* Export transaction data to Excel
* Downloadable business reports

### 🤖 AI Integration

* Google Generative AI support
* AI-powered business assistance
* Intelligent data insights

### 🔔 User Experience

* Real-time notifications
* Responsive design
* Modern UI built with Tailwind CSS

---

## 🛠 Tech Stack

### Frontend

* React 19
* TypeScript
* Vite 6
* React Router DOM
* Tailwind CSS 4

### Backend

* Express.js

### Visualization

* Recharts

### Utilities

* QR Code Generator
* QR Code Scanner
* jsPDF
* XLSX

### AI

* Google Generative AI SDK

---

## 📂 Project Structure

```text
cashier-app-on-main/
│
├── public/
│   └── Static Assets
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── hooks/
│   └── utils/
│
├── .env.example
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/kknkrnwn/cashier-app-on-main.git
cd cashier-app-on-main
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file based on `.env.example`.

Example:

```env
GOOGLE_API_KEY=your_google_ai_api_key
```

---

## ▶️ Running Development Server

```bash
npm run dev
```

Application will run on:

```text
http://localhost:3000
```

---

## 🏗 Build Production

```bash
npm run build
```

Build output:

```text
dist/
```

---

## 👀 Preview Production Build

```bash
npm run preview
```

---

## 🧹 Clean Build Files

```bash
npm run clean
```

---

## ✅ Type Checking

```bash
npm run lint
```

---

## 📦 Main Dependencies

| Package       | Purpose                  |
| ------------- | ------------------------ |
| React         | User Interface           |
| TypeScript    | Type Safety              |
| Vite          | Development & Build Tool |
| Tailwind CSS  | Styling                  |
| React Router  | Routing                  |
| Express       | Backend Services         |
| Recharts      | Data Visualization       |
| html5-qrcode  | QR Scanner               |
| qrcode        | QR Generator             |
| jsPDF         | PDF Export               |
| xlsx          | Excel Export             |
| @google/genai | AI Integration           |

---

## 📸 Screenshots

### Dashboard

<img width="954" height="446" alt="image" src="https://github.com/user-attachments/assets/5a452329-30ca-4801-8704-acf9b35484a9" />

### Transaction Page

<img width="650" alt="image" src="https://github.com/user-attachments/assets/8670b2e2-af22-46f0-9881-c3f98460327a" />

### QR Scanner

<img width="650" alt="image" src="https://github.com/user-attachments/assets/1696bda4-266f-4280-92b9-e1086006505b" />

### Reports

<img width="650" alt="image" src="https://github.com/user-attachments/assets/411f17ea-2a59-4d2b-ab2c-cd7e86103075" />

### Login Dashboard

<img width="182" alt="image" src="https://github.com/user-attachments/assets/13c7cffd-7b7e-4ec2-bc07-ea26701070d9" />


---

## 🔒 Environment Variables

| Variable       | Description                  |
| -------------- | ---------------------------- |
| GOOGLE_API_KEY | Google Generative AI API Key |

---

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Kukun Karuniawan**

GitHub: https://github.com/kknkrnwn

---

## ⭐ Support

If you find this project useful, please consider giving it a star on GitHub.
