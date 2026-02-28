# SmartBed AI - Hackathon Demo Script

*Estimated Time: 3 Minutes*

## Pre-Demo Checklist
1. Ensure the DB is seeded (`cd backend && python -m seed`) [This was automatically done upon setup]
2. Ensure backend is running: `cd backend && .\venv\Scripts\uvicorn backend.main:app --reload --port 8000`
3. Ensure frontend is running: `npm run dev` in the root folder.
4. Open `http://localhost:5173` in a full screen browser window.
5. Have your phone/watch ready to time the 3-minute pitch.

---

## 🕒 0:00 - The Problem (Login Screen)
*"Hospitals are bleeding money and losing lives because of a simple logistical nightmare: placing the right patient in the right bed at the right time. Today, nurses rely on whiteboards and phone calls. It takes hours. Introduce SmartBed AI."*
- **Action:** Click the "Admin" or "Manager" demo button to instantly log in.

## 🕒 0:30 - Real-Time Visibility (Dashboard View)
*"SmartBed AI provides real-time, hospital-wide visibility. Here is our dashboard tracking live occupancy and ED bottlenecks."*
- **Action:** Point out the KPI cards. Note the flashing **🔴 Live Connection** badge in the top right, proving the use of WebSockets.
- **Action:** Point to the dark-mode Glassmorphism Floor Plans at the bottom.
- *"We replace the legacy whiteboard with an interactive floor plan. Red means occupied, green means available."*

## 🕒 1:00 - Actioning the Queue (Triage View)
*"But visibility isn't enough. Let's look at the ED Queue."*
- **Action:** Click **Triage & Allocation** in the left sidebar.
- *"We have patients waiting. Matching acuity, constraints, ward capacity, and wait times is an NP-Hard math problem."*
- **Action:** Click the big purple **Run Global Optimization** button.
- *"We use Mixed-Integer Linear Programming (MILP) to run thousands of permutations instantly. Our AI just matched every critical patient to the mathematically optimal bed."*
- **Action:** Point to the **98% Match** and the new bed assignments.

## 🕒 2:00 - Proactive AI (Predictions View)
*"What if we could see the crash before it happens?"*
- **Action:** Click **AI Predictions**.
- *"This isn't hardcoded. Under the hood, we are running an ARIMA Time-Series model trained on historical data. It sees a massive weekend surge coming—95% confidence interval boundaries. Because we know this today, we can staff appropriately."*

## 🕒 2:30 - What-If Simulator (Simulator View)
*"Finally, hospital admins need to plan for the worst."*
- **Action:** Click **What-If Simulator**.
- *"What happens if there's a mass casualty event or a massive flu surge?"*
- **Action:** Click **Flu Surge** or **MCI / Disaster** preset. Watch the chart update.
- *"You can instantly see the hour-by-hour projection. In this disaster scenario, peak occupancy hits critical levels, and the system automatically prompts us to preemptively divert ambulances."*

## 🕒 3:00 - Conclusion
*"SmartBed AI: It's not a dashboard; it's a living algorithm that saves time, saves money, and saves lives. Thank you."*
