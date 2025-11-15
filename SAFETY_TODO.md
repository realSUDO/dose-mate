# 🛡️ DoseMate Safety & Guardrails TODO

## 🔥 High Priority Safety Tasks

### 1. **PDF Content Safety** 
- [ ] Validate PDF text contains medical/prescription content
- [ ] Filter out non-medical content from PDF text
- [ ] Sanitize extracted text before storing
- [ ] Block inappropriate/harmful content in PDFs

### 2. **LLM Input Guardrails**
- [ ] Restrict LLM system prompts to healthcare only
- [ ] Add content filtering before sending to LLM
- [ ] Validate user queries are medical-related
- [ ] Block non-healthcare questions

### 3. **LLM Output Guardrails**
- [ ] Scan LLM responses for harmful content
- [ ] Ensure responses stay within healthcare domain
- [ ] Block medical advice beyond general information
- [ ] Add disclaimers to all medical responses

### 4. **Healthcare Domain Restrictions**
- [ ] Create healthcare keyword whitelist
- [ ] Block non-medical topics (politics, violence, etc.)
- [ ] Restrict to medication/prescription guidance only
- [ ] Add "consult doctor" disclaimers

## 🛠️ Implementation Plan

### Phase 1: Content Safety Service
```javascript
// services/contentSafety.js
- validatePDFContent(text) - Check if medical content
- sanitizeText(text) - Clean harmful content
- isHealthcareQuery(query) - Validate user questions
```

### Phase 2: LLM Guardrails
```javascript
// services/guardrails.js
- filterInput(text) - Pre-LLM content filtering
- validateOutput(response) - Post-LLM response checking
- addMedicalDisclaimer(response) - Add safety disclaimers
```

### Phase 3: Healthcare Domain Enforcement
```javascript
// Enhanced system prompts with strict healthcare focus
// Keyword-based filtering for non-medical content
// Response validation against healthcare guidelines
```

## 🎯 Success Criteria
- [ ] Only medical PDFs are processed
- [ ] LLM only responds to healthcare queries
- [ ] All responses include appropriate disclaimers
- [ ] Non-medical content is blocked
- [ ] System stays within medication guidance domain

## 📝 Safety Guidelines
- Never provide specific medical diagnoses
- Always recommend consulting healthcare professionals
- Focus on medication information and general guidance
- Block harmful or inappropriate content
- Maintain user privacy and data security
