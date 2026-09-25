# 🔄 SkillSwap — Peer-to-Peer Student Skill Exchange Platform

> **Hackathon Edition** | Built with Node.js, Express, MongoDB, React, Vite, and Tailwind CSS.

---

## 🎯 1. Problem Statement
Students often possess valuable skills (such as React, Python, UI Design, or French) while simultaneously needing assistance in other areas. However, traditional tutoring is expensive, and finding peers for mutual, reciprocal learning without monetary exchange is difficult. Existing platforms lack automated reciprocal match-making and trust-building rating mechanisms tailored for peer-to-peer student exchanges.

---

## 🚀 2. Solution Overview
**SkillSwap** is a peer-to-peer student skill exchange platform that automatically connects students who have complementary learning goals. Utilizing an intelligent reciprocal matching engine, SkillSwap identifies two-way skill swaps (User A teaches what User B wants to learn, and vice versa), calculates detailed compatibility scores, facilitates exchange request workflows, and maintains community trust via post-exchange ratings.

---

## 🛠️ 3. Tech Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS v4, Axios, React Router v7, Lucide Icons, Context API
- **Backend**: Node.js, Express.js, MongoDB (Mongoose 8), JWT Authentication, BcryptJS
- **Database**: MongoDB (Local or MongoDB Atlas)

---

## ✨ 4. Key Features

- 👤 **Student Profiles & Portfolio**: Manage bio, availability schedules (Weekdays, Weekends, Evenings, Flexible), and lists of offered/required skills with proficiency and urgency levels.
- 🔍 **Skill Explorer & Search**: Filter peers by skill keywords, category (Technology, Design, Language, Academic, Music, Business), availability, and minimum star rating.
- ⚡ **Intelligent Reciprocal Matching Engine**: Automatically analyzes complementary skills between users, ranking candidates by match percentage with a visual score breakdown.
- 📬 **Request & Exchange Workflow**: Send, accept, reject, and complete exchange proposals with real-time status badges.
- ⭐ **Trust & Reputation Matrix**: Post-exchange rating system (1–5 stars + written reviews) with automatic weighted average recalculations.
- 🚀 **Hackathon Quick-Login**: 1-click preset login buttons for instant live judging demonstrations.

---

## ⭐ 5. How the Matching Algorithm Works

The core of SkillSwap is its proprietary **Reciprocal Match Scoring Algorithm** implemented in `/server/routes/userRoutes.js`. It calculates a compatibility score out of **100 Points** for any given candidate user based on four weighted factors:

### 📐 Scoring Formula:
$$\text{Total Score} = \min(99, \text{Reciprocal Points} + \text{Skill Fit Points} + \text{Availability Points} + \text{Rating Points})$$

| Component | Max Points | Logic & Criteria |
| :--- | :--- | :--- |
| **Reciprocal Swap Base** | **50 Pts** | **50 pts** if 2-way match exists (User A teaches User B AND User B teaches User A); **25 pts** if 1-way match; **10 pts** if category overlaps. |
| **Skill Level & Fit** | **25 Pts** | Base 15 pts + **10 pts** if peer's proficiency is `Expert` (+5 pts for `Intermediate`). |
| **Schedule Alignment** | **15 Pts** | **15 pts** if availability schedules match or either user is `Flexible`; **5 pts** otherwise. |
| **Reputation Bonus** | **10 Pts** | $\left(\frac{\text{Peer Avg Rating}}{5.0}\right) \times 10$ points. |

### 💡 Example Calculation:
- **Sarah Chen** (Offers: *React [Expert]*, Wants: *UI Design*, Availability: *Weekends*)
- **Alex Rivera** (Offers: *UI Design [Expert]*, Wants: *React*, Availability: *Weekends*, Rating: *4.8/5.0*)

1. **Reciprocal Match**: Sarah teaches React (Alex wants) AND Alex teaches UI Design (Sarah wants) $\rightarrow$ **+50 pts**
2. **Skill Level Fit**: Alex is an *Expert* in UI Design $\rightarrow$ **+25 pts**
3. **Schedule Alignment**: Both available on *Weekends* $\rightarrow$ **+15 pts**
4. **Reputation Bonus**: $(4.8 / 5) \times 10 \rightarrow$ **+9.6 pts**
- **Total Calculated Score**: $\min(99, 50 + 25 + 15 + 9.6) =$ **99% Match** (Rank #1)

---

## 📥 6. Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/angelin-grace/hackathon.git
   cd hackathon
   ```

2. **Configure & Start Backend**:
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Ensure MONGO_URI and JWT_SECRET are set in server/.env
   
   # Load 15 realistic seed users & demo exchange requests
   npm run seed
   
   # Start backend dev server (runs on http://localhost:5000)
   npm run dev
   ```

3. **Start Frontend Client**:
   ```bash
   cd ../client
   npm install
   
   # Start Vite dev server (runs on http://localhost:3000)
   npm run dev
   ```

4. Open `http://localhost:3000` in your web browser.

---

## 🔑 7. Demo Login Credentials

For easy live judging, the login screen includes **1-click quick login buttons**, or you can manually log in using:

| User Name | Email | Password | Primary Role |
| :--- | :--- | :--- | :--- |
| **Sarah Chen** | `sarah@example.com` | `demo1234` | Full-Stack Dev (Teaches React, Wants UI Design) |
| **Alex Rivera** | `alex@example.com` | `demo1234` | Product Designer (Teaches UI Design, Wants React) |
| **David Miller** | `david@example.com` | `demo1234` | Data Scientist (Teaches Python, Wants French) |
| **Elena Rostova** | `elena@example.com` | `demo1234` | Polyglot (Teaches French/Guitar, Wants Python) |

*(Note: All 15 seeded demo accounts share the password `demo1234`)*

---

## 📸 8. Screenshots & User Interface

| Dashboard & Profile Overview | Match Matrix (Demo Centerpiece) |
| :---: | :---: |
| ![Dashboard Screenshot](https://raw.githubusercontent.com/placeholder/dashboard.png) | ![Matches Screenshot](https://raw.githubusercontent.com/placeholder/matches.png) |

| Request Workflow & Status Badges | Interactive Rating & Review Modal |
| :---: | :---: |
| ![Requests Screenshot](https://raw.githubusercontent.com/placeholder/requests.png) | ![Rating Modal Screenshot](https://raw.githubusercontent.com/placeholder/rating.png) |

---

## 🔮 9. Future Improvements

- 💬 **Real-Time In-App Messaging**: Socket.io integration for instant peer chat once an exchange is accepted.
- 📅 **Calendar & Video Call Scheduling**: Google Calendar integration to book exchange sessions directly.
- 🏅 **Skill Badge Verification**: Automated peer quizzes or github integration to verify skill proficiency levels.

---

*Built with ❤️ for the Hackathon.*
