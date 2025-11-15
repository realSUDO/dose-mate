## **TODO.md for DoseMate Deployment** ✅

### **PHASE 1: BACKEND DEPLOYMENT (Cloud Run)**

#### **Backend Preparation:**
- [ ] **Create Dockerfile** in backend folder
- [ ] **Create .dockerignore** file
- [ ] **Update server.js** for production:
  - [ ] Add `/health` endpoint
  - [ ] Use `process.env.PORT`
  - [ ] Update CORS for Netlify domain
- [ ] **Verify environment variables**:
  - `MONGODB_URI`
  - `AGORA_APP_ID` 
  - `AGORA_APP_CERTIFICATE`
  - `and other`

#### **Google Cloud Setup:**
- [ ] **Install Google Cloud CLI** or use Cloud Console
- [ ] **Create Google Cloud project**
- [ ] **Enable Cloud Run API**
- [ ] **Authenticate** (`gcloud auth login`)

#### **Deploy Backend:**
- [ ] **Build Docker image** locally
- [ ] **Push to Container Registry**
- [ ] **Deploy to Cloud Run** via CLI or Console
- [ ] **Copy production URL** (Cloud Run endpoint)

### **PHASE 2: FRONTEND DEPLOYMENT (Netlify)**

#### **Frontend Preparation:**
- [ ] **Update API base URL** to Cloud Run endpoint
- [ ] **Build web version**: `npx expo export --platform web`
- [ ] **Verify 'dist' folder** is created

#### **Netlify Deployment:**
- [ ] **Go to [netlify.com/drop](https://netlify.com/drop)**
- [ ] **Drag & drop 'dist' folder**
- [ ] **Copy live Netlify URL**
- [ ] **Test live frontend**

### **PHASE 3: INTEGRATION TESTING**

#### **Connection Testing:**
- [ ] **Test backend health**: `curl https://backend-url/health`
- [ ] **Test frontend-backend connection**
- [ ] **Verify CORS** working
- [ ] **Test form submission** from live frontend
- [ ] **Check MongoDB connection** from deployed backend

#### **Demo Preparation:**
- [ ] **Prepare demo script**
- [ ] **Test complete user flow**:
  - User registration → Medication setup → Dashboard
- [ ] **Verify Agora voice calls** (if integrated)
- [ ] **Prepare backup screenshots/video**

### **PHASE 4: FINAL CHECKS**

#### **Quick Validation:**
- [ ] **Both URLs accessible** (no 404 errors)
- [ ] **Database operations working** (create/read users)
- [ ] **Mobile-responsive** on phones
- [ ] **Elderly-friendly UX** intact

#### **Emergency Backup:**
- [ ] **Screen recording** of working demo
- [ ] **Postman collection** of working APIs
- [ ] **MongoDB Atlas data** screenshot

---

## **URGENT PRIORITY ORDER:**
1. **Backend on Cloud Run** ⚡ (MANDATORY)
2. **Frontend on Netlify** ⚡ (For judges)
3. **Integration testing** 🔧
4. **Demo preparation** 🎤

---

## **EXPECTED OUTCOME:**
```
Frontend: https://dosemate-app.netlify.app
Backend:  https://dosemate-backend.a.run.app
Demo: ✅ Fully functional live application
```

**Start with the Dockerfile creation!** 🐳

