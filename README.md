
<div align="center">

[![CodePulse Banner](https://i.imghippo.com/files/hby6554w.png)](https://i.imghippo.com/files/hby6554w.png)


**Your personal AI-powered interview preparation platform**

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google AI](https://img.shields.io/badge/Google_AI-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage-guide) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

CodePulse is a comprehensive interview preparation tool that leverages **Google's Generative AI** to provide personalized mock interviews, resume analysis, company insights, and more. Whether you're a fresher or a senior professional, CodePulse adapts to your needs and helps you prepare effectively.

## ✨ Features

### 🎯 Core Features

| Feature | Description |
|---------|-------------|
| **🎁 Personalized Prep Kit** | Create customized interview preparation kits with your target job role, description, and resume |
| **❓ Q&A Section** | AI-generated general/HR and technical questions with high-quality model answers |
| **💻 Practical Challenges** | Hands-on coding problems adapted for your specific role and seniority level |
| **🎤 Mock Interview** | Interactive AI-powered sessions with intelligent follow-up questions |
| **📄 Resume Analyzer** | Comprehensive analysis with ATS compatibility and match scores |
| **🏢 Company Insights** | Real-time research briefings on any company |
| **🤔 Doubt Buster** | Ask anything, anytime—get clear explanations instantly |
| **🎯 Dream Company** | Generate randomized questions for any job role at various difficulty levels |

### 🌟 Special Features

- **💡 Explain This**: Click the question mark icon for instant detailed explanations
- **📥 Export to PDF**: Save sessions and reports for offline review
- **🔄 Refresh Content**: Generate new questions and challenges with one click

## 🛠️ Tech Stack

```
Frontend:        React 19.1.1
Build Tool:      Vite 6.2.0
Language:        TypeScript 5.8.2
AI Engine:       Google Generative AI (@google/genai)
Environment:     dotenv
```

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn**
- **Google Generative AI API Key** - [Get it here](https://ai.google.dev/)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/miteshanshu/CodePulse-AI-Powered-Interview-Coach.git

# 2. Navigate to project directory
cd CodePulse-AI-Powered-Interview-Coach

# 3. Install dependencies
npm install

# 4. Create .env file in root directory
touch .env

# 5. Add your API key to .env
echo "VITE_GOOGLE_AI_API_KEY=your_api_key_here" > .env

# 6. Start development server
npm run dev

# 7. Open browser and navigate to
# http://localhost:5173
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_GOOGLE_AI_API_KEY=your_actual_api_key_here
```

> ⚠️ **Important**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 🚀 Start development server at `http://localhost:5173` |
| `npm run build` | 🏗️ Build optimized production bundle |
| `npm run preview` | 👀 Preview production build locally |

## 📖 Usage Guide

### 🎬 Getting Started

#### 1️⃣ Generate Your Prep Kit

```
Home Tab → Enter Job Role → Add Job Description (optional) → Upload Resume (optional) → Generate Prep Kit
```

**Example:**
- Job Role: "Senior React Developer"
- Add detailed job description for better results
- Upload your resume for personalized questions

#### 2️⃣ Explore Your Content

- **Q&A Tab**: Review AI-generated interview questions
- **Practical Challenges**: Practice hands-on coding problems
- **Refresh Button**: Get new content anytime

#### 3️⃣ Use Standalone Tools

- 🎤 **Mock Interview**: Practice without prep kit
- 📄 **Resume Analyzer**: Check ATS compatibility
- 🏢 **Company Insights**: Research target companies
- 🤔 **Doubt Buster**: Ask any questions
- 🎯 **Dream Company**: Practice for specific companies

### 💡 Pro Tips

- ✅ Provide detailed job descriptions for accurate prep kits
- ✅ Use Mock Interview regularly to build confidence
- ✅ Export important sessions to PDF
- ✅ Use "Explain This" for unfamiliar concepts
- ✅ Refresh content to practice diverse questions

## 📁 Project Structure

```
CodePulse-AI-Powered-Interview-Coach/
│
├── src/
│   ├── components/              # React UI components
│   ├── contexts/                # React context providers
│   │   └── AppContext.tsx       # Global application state
│   ├── services/                # AI integration & API services
│   │   └── geminiService.ts     # Google Generative AI service
│   ├── App.tsx                  # Main application component
│   ├── index.tsx                # Application entry point
│   └── types.ts                 # TypeScript type definitions
│
├── public/                      # Static assets
├── .env                         # Environment variables (create this)
├── .gitignore                   # Git ignore rules
├── index.html                   # HTML entry point
├── package.json                 # Project metadata & dependencies
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
└── README.md                    # Documentation
```

## 🤝 Contributing

Contributions are always welcome! Follow these steps:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/CodePulse-AI-Powered-Interview-Coach.git`
3. **Create** a feature branch: `git checkout -b feature/AmazingFeature`
4. **Commit** your changes: `git commit -m 'Add some AmazingFeature'`
5. **Push** to the branch: `git push origin feature/AmazingFeature`
6. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write clear commit messages
- Update documentation for new features
- Test thoroughly before submitting PR

## 🐛 Issues & Bugs

Found a bug? Have a feature request? Please open an issue on the [GitHub Issues](https://github.com/miteshanshu/CodePulse-AI-Powered-Interview-Coach/issues) page.

## 📄 License

This project is **private and proprietary**.

## 👨‍💻 Author

**Mitesh Kr Anshu**

- GitHub: [@miteshanshu](https://github.com/miteshanshu)
- LinkedIn: [@miteshanshu](https://www.linkedin.com/in/miteshanshu/)

## 🙏 Acknowledgments

- 🎯 **Google Generative AI** for powering intelligent features
- ⚛️ **React Team** for the amazing framework
- ⚡ **Vite Team** for blazing-fast build tool
- 🌟 All **contributors** and **testers** who helped improve CodePulse

## 📞 Support

Need help? Have questions?

- 📧 Open an issue on [GitHub](https://github.com/miteshanshu/CodePulse-AI-Powered-Interview-Coach/issues)
- 💬 Contact the author directly

---

<div align="center">

**Made with ❤️ and ☕ by Mitesh Kr Anshu**

### Happy Interview Prep! 🎉

⭐ **Star this repository if you found it helpful!** ⭐

</div>
