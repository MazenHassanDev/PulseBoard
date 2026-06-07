# Prompt: Build the PulseBoard Frontend

Read CONTEXT.md and BRIEF.md before writing anything.

Build the complete React + Vite frontend for PulseBoard. The backend API is already running. Your job is to build a clean, functional UI that connects to it.

---

## Stack
- React + Vite
- Tailwind CSS for styling
- Axios for API calls
- React Router for navigation
- Recharts for the chart

---

## Auth & Token Handling
- On login, store the access token in localStorage as `access` and refresh token as `refresh`
- Create an Axios instance with a base URL pointing to `http://localhost:8000` (from an env variable `VITE_API_URL`)
- Add a request interceptor that attaches `Authorization: Bearer <token>` to every request automatically
- If a request returns 401, clear localStorage and redirect to login
- Protect all routes — if no token in localStorage, redirect to `/login`

---

## Pages & Routes

### `/login`
- Email/username and password fields
- On submit, POST to `/api/auth/login/` and store tokens
- Redirect to `/dashboard` on success
- Link to register page

### `/register`
- Username, email, password fields
- On submit, POST to `/api/auth/register/`
- Redirect to `/login` on success
- Link to login page

### `/dashboard`
This is the main page. It has two sections:

**Campaign Table**
- Fetch all campaigns from `GET /api/campaigns/`
- Display columns: Name, Platform, Spend, Impressions, Clicks, Conversions, Revenue, CTR, CPC, ROAS
- CTR, CPC, ROAS come from the API response (already computed)
- Sortable columns — clicking a column header sorts ascending/descending
- Filter by platform — a dropdown that filters the table client-side
- Each row has an "Explain" button that opens the AI explainer modal for that campaign

**Chart**
- A bar chart using Recharts showing ROAS per campaign
- Use campaign name on X axis, ROAS value on Y axis
- Keep it simple and readable

### `/add`
- Form with fields: Name, Platform (dropdown with google/meta/instagram/tiktok/pinterest), Spend, Impressions, Clicks, Conversions, Revenue
- On submit, POST to `/api/campaigns/`
- Redirect to `/dashboard` on success
- Show validation errors from the API if any

### `/upload`
- A file input that only accepts `.csv` files
- On submit, POST to `/api/campaigns/upload/` as form-data with key `file`
- Display the response — how many were imported, how many skipped, and the errors list with row numbers and reasons
- Keep it simple, no drag and drop needed

---

## Layout
- Sidebar navigation on the left with links to: Dashboard, Add Campaign, Upload CSV
- Logout button at the bottom of the sidebar that clears localStorage and redirects to `/login`
- Main content area on the right
- Clean, minimal design using Tailwind

---

## AI Explainer Modal
- Triggered by the "Explain" button on each campaign row
- On open, immediately call `GET /api/campaigns/<pk>/explain/`
- Show a loading state while waiting for the response
- Display the campaign name as the modal title
- Display the explanation text as the modal body
- Close button to dismiss
- Handle errors gracefully — show a message if the API call fails

---

## Project Structure
Organize files like this:
```
src/
├── api/
│   └── axios.js          # Axios instance with interceptors
├── components/
│   ├── Sidebar.jsx
│   ├── CampaignTable.jsx
│   ├── CampaignChart.jsx
│   ├── ExplainerModal.jsx
│   └── ProtectedRoute.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── AddCampaign.jsx
│   └── UploadCSV.jsx
└── App.jsx
```

---

## Environment Variables
Create a `.env` file in the frontend root:
```
VITE_API_URL=http://localhost:8000
```

---

## Code Style
- Functional components with hooks only
- Keep components focused — no giant files
- Use useState and useEffect for data fetching
- No unnecessary dependencies beyond what's already installed

---

## Do NOT
- Do not write any backend code
- Do not add Redux or any state management library
- Do not add animations or complex UI effects
- Do not write tests
- Pixel-perfect design is not the goal — clean and functional is
