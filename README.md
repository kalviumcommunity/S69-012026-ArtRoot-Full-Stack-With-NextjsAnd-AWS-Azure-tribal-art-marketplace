# Project Plan – 4-Week Simulated Work Sprint

## Project Title
**ArtRoot – A Fair-Trade Tribal & Rural Art Marketplace**

---

## 1. Problem Statement & Solution Overview

### Problem Statement
Tribal and rural artists often lose the true value of their artwork due to middlemen who control pricing, market access, and distribution. These intermediaries reduce artist earnings, obscure authenticity, and disconnect buyers from the cultural significance of the art.

This issue is especially prominent in rural and indigenous communities that lack digital access and global reach, leading to economic inequality and cultural erosion.

### Solution Overview
**ArtRoot** is a full-stack web platform that directly connects tribal and rural artists with global buyers. The platform eliminates middlemen, allows artists to set fair prices, and builds trust through verified artist profiles and authenticity indicators.

### Checklist
- **Why is this problem relevant?**  
  Artists lose income and recognition; buyers lack authenticity assurance.
- **Who faces it (target users)?**  
  Tribal & rural artists, global buyers, cultural organizations.
- **What value does your solution bring?**  
  Fair trade, transparency, authenticity, cultural preservation.

---

## 2. Scope & Boundaries

### ✅ In Scope (MVP)
- User authentication (Artist & Buyer)
- Artwork listing and browsing
- Artist profile pages
- Artwork detail pages with stories
- Verified authenticity badge (manual/admin-based)
- Secure REST APIs
- Cloud deployment (AWS/Azure + Vercel)

### ❌ Out of Scope
- Real payment gateway integration
- Blockchain/NFT certificates
- Mobile application
- Logistics & shipping integration
- Advanced analytics

---

## 3. Roles & Responsibilities

| Role | Team Member | Key Responsibilities |
|----|----|----|
| Frontend Lead | **Yashuwant John M Vijay** | Next.js UI, routing, API integration, responsive design |
| Backend Lead | **Konetisetty Venkateswara** | API design, authentication, business logic, DB integration |
| Cloud + Integration Lead | **Naorem Nganthoiba Singh** | AWS/Azure deployment, CI/CD, integration |

---

## 4. Sprint Timeline (4 Weeks)

### Week 1 – Setup & Design  
**Focus:** Architecture & planning  
**Deliverables:**
- Project repo setup
- Frontend & backend boilerplate
- GitHub workflow
- HLD & LLD
- Database schema (Users, Artists, Artworks)
- Environment variable strategy

---

### Week 2 – Backend & Database  
**Focus:** Core backend development  
**Deliverables:**
- Database setup
- Auth APIs (Signup/Login)
- Artwork CRUD APIs
- Artist profile APIs
- Validation & error handling
- Seed demo data

---

### Week 3 – Frontend & Integration  
**Focus:** UI & API integration  
**Deliverables:**
- Public & protected routes
- Homepage & marketplace
- Artwork listing & detail pages
- Artist profiles
- Loading & error states

---

### Week 4 – Deployment & Finalization  
**Focus:** Production readiness  
**Deliverables:**
- Cloud deployment
- Environment & secrets management
- End-to-end testing
- Final documentation
- MVP demo preparation

---

## 5. Deployment and Testing Plan

### Testing Strategy
- Unit testing for backend APIs
- Manual API testing (Postman)
- End-to-end testing:
  - Browse artworks
  - View artwork details
  - Upload artwork

### Deployment Strategy
- Frontend: Vercel
- Backend: AWS EC2 / Azure App Service
- Database: MongoDB Atlas
- Secrets: Environment variables

---

## 6. MVP (Minimum Viable Product)

### Core MVP Features
- User signup & login
- Browse artworks
- View artwork details
- Artist profile & storytelling
- Verified authenticity indicator
- Fully deployed application

---

## 7. Core Project Components

### Authentication
- Sign Up
- Sign In
- JWT-based authentication

### Core Application
- Marketplace dashboard
- Artist profile management
- Artwork upload (artist)

### General Pages
- Home page (fair-trade mission)
- Navbar & footer
- Error & loading pages

---

## 8. Functional Requirements
- Secure user authentication
- Artists can add/manage artworks
- Buyers can browse/view artworks
- Artwork shows artist story & region
- Verified authenticity indicator

---

## 9. Non-Functional Requirements
- Performance: API response < 500ms
- Scalability: 100+ concurrent users
- Security: Hashed passwords, protected APIs
- Reliability: Stable cloud deployment

---

## 10. Success Metrics
- Fully deployed MVP
- End-to-end integration
- Clear fair-trade value demonstration
- Positive mentor/demo feedback

---

## 11. Risks & Mitigation

| Risk | Impact | Mitigation |
|----|----|----|
| Limited time | Incomplete features | Strict MVP scope |
| Integration delays | Demo issues | Early API contracts |
| Cloud issues | Downtime | Local + cloud testing |

---

## 12. Conclusion
ArtRoot empowers tribal and rural artists by providing direct digital access to global buyers. This 4-week sprint delivers a clean, scalable MVP that highlights transparency, fairness, and cultural preservation.
