# OmniTools — All-in-one Utility Web App

OmniTools is a lightweight, fast, dark-themed React web application that provides dozens of useful tools for developers and everyday users.  
Everything runs client-side — fast, private, and no login required.

---

## 🚀 Features
OmniTools includes:

### 🧮 General Tools
- Calculator (with history)
- Unit converter (length, weight, temp, data)
- Currency converter (manual rates)
- Price-per-weight calculator
- Age calculator
- Timer, Stopwatch, Countdown
- To-do list (localStorage backed)

### 🧾 Text & Content Tools
- Case converter (UPPER, lower, Title Case)
- Remove duplicate lines
- Remove extra spaces
- Word & character counter
- Text diff checker
- Random text generator
- Lorem Ipsum generator

### 👨‍💻 Developer Tools
- JSON formatter + tree view
- YAML ↔ JSON converter (`js-yaml`)
- Base64 encoder/decoder
- URL encoder/decoder
- SHA-256 hash generator
- UUID generator
- Regex builder
- Cron expression helper

### 🎨 Design Tools
- Color picker
- Palette generator
- CSS gradient generator (optional)
- Box-shadow generator (optional)

### 🖼️ Image Tools
- Image resizer (client-side `<canvas>`)
- Image compressor
- PNG ⇄ JPG ⇄ WebP converter
- Favicon generator (optional)
- Avatar maker (optional)

### 💳 Finance Tools
- GST calculator
- Discount calculator
- EMI calculator
- Simple/Compound interest
- Salary tax helper (India)

### 🔧 Other Utilities
- QR code generator
- Password generator
- File converters (CSV ↔ JSON, CSV ↔ Excel)
- Unix timestamp converter
- Day finder (find weekday from date)

---

## 🛠 Tech Stack
- **React** (Hooks)
- **Vite** (fast bundler)
- **Tailwind CSS**
- **lucide-react** icons
- **js-yaml** (CDN)
- **Browser APIs**: Canvas, Clipboard, Crypto, FileReader

---

## 📦 Installation (Local Setup)

### 1. Create project (using Vite)
```bash
npm create vite@latest omni-tools -- --template react
cd omni-tools
```