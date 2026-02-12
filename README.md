# CivicPulse

CivicPulse is a modern civic engagement platform that bridges the gap between citizens and municipal departments. It incentivizes community reporting of local issues (like potholes, garbage, streetlights) through a gamified rewards system while providing authorities with efficient tools to track and resolve them.

## 🚀 Features

### For Citizens
- **Report Issues**: Submit geolocation-tagged reports with photos and descriptions.
- **Interactive Map**: View issues in your area on a dynamic map.
- **Community Feed**: Track the status of reported issues in real-time.
- **Rewards System**: Earn karma points for reporting and verifying issues. Redeem points for real-world rewards (vouchers, merchandise).
- **Gamification**: Visual feedback and wallet system to encourage participation.

### For Departments
- **Dashboard**: Overview of pending, in-progress, and resolved issues.
- **Task Management**: Update status of reports (Submitted -> In Progress -> Resolved).
- **Verification Logic**: Reward citizens for verifying fixed issues.
- **Analytics**: Track resolution rates and community impact.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Database**: [SQLite](https://www.sqlite.org/) with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Client-side persistence)
- **Maps**: [Leaflet](https://leafletjs.com/) (via React Leaflet)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd civic-pulse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # Seed the database with initial data (Users, Rewards, Reports)
   node prisma/seed.js
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Test Credentials

The database is seeded with two default users for testing:

| Role | Email | Features |
|------|-------|----------|
| **Citizen** | `citizen@example.com` | Report issues, View Map, Earn/Redeem Rewards |
| **Department** | `dept@example.com` | View Dashboard, Update Status, Manage Reports |

*Note: The login page simulates authentication. Select "Citizen" or "Department" to auto-fill these credentials.*

## 📂 Project Structure

- `src/app`: Next.js App Router pages
- `src/components`: Reusable UI components
- `src/actions`: Server Actions for data mutation
- `src/lib`: Utilities (Database connection, Store)
- `prisma`: Database schema and seed script

## 📄 License

This project is open-source and available under the MIT License.
