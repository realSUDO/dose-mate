class ContentSafetyService {
  constructor() {
    // Healthcare-related keywords for validation
    this.healthcareKeywords = [
      'medication', 'medicine', 'prescription', 'dosage', 'tablet', 'capsule',
      'mg', 'ml', 'dose', 'daily', 'twice', 'morning', 'evening', 'doctor',
      'pharmacy', 'patient', 'treatment', 'symptoms', 'side effects',
      'allergic', 'reaction', 'blood pressure', 'diabetes', 'pain', 'fever',
      'antibiotic', 'vitamin', 'supplement', 'injection', 'inhaler'
    ];

    // Harmful content patterns to block
    this.harmfulPatterns = [
      /suicide|kill|death|harm|violence/i,
      /illegal|drug abuse|overdose/i,
      /politics|religion|controversial/i,
      /personal information|ssn|credit card/i
    ];

    console.log('🛡️ Content Safety Service initialized');
  }

  // Validate if PDF text contains medical/prescription content
  validatePDFContent(text) {
    try {
      if (!text || text.trim().length < 50) {
        return {
          isValid: false,
          reason: 'Text too short or empty',
          confidence: 0
        };
      }

      const lowerText = text.toLowerCase();
      let healthcareMatches = 0;

      // Count healthcare keyword matches
      this.healthcareKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          healthcareMatches++;
        }
      });

      const confidence = healthcareMatches / this.healthcareKeywords.length;
      const isValid = confidence > 0.1; // At least 10% healthcare keywords

      console.log(`🔍 PDF validation: ${healthcareMatches} healthcare keywords found, confidence: ${confidence.toFixed(2)}`);

      return {
        isValid,
        reason: isValid ? 'Contains medical content' : 'No significant medical content found',
        confidence,
        healthcareMatches
      };
    } catch (error) {
      console.error('❌ PDF validation error:', error);
      return {
        isValid: false,
        reason: 'Validation error',
        confidence: 0
      };
    }
  }

  // Sanitize text by removing harmful content
  sanitizeText(text) {
    try {
      let sanitized = text;

      // Remove harmful patterns
      this.harmfulPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '[FILTERED]');
      });

      // Remove potential PII patterns
      sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN-FILTERED]'); // SSN
      sanitized = sanitized.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD-FILTERED]'); // Credit card

      console.log('🧹 Text sanitized');
      return sanitized;
    } catch (error) {
      console.error('❌ Text sanitization error:', error);
      return text; // Return original if sanitization fails
    }
  }

  // Check if user query is healthcare-related
  isHealthcareQuery(query) {
    try {
      if (!query || query.trim().length < 3) {
        return false;
      }

      const lowerQuery = query.toLowerCase();
      
      // Check for healthcare keywords
      const hasHealthcareKeywords = this.healthcareKeywords.some(keyword => 
        lowerQuery.includes(keyword)
      );

      // Check for harmful content
      const hasHarmfulContent = this.harmfulPatterns.some(pattern => 
        pattern.test(query)
      );

      const isValid = hasHealthcareKeywords && !hasHarmfulContent;

      console.log(`🔍 Query validation: "${query}" - Valid: ${isValid}`);
      return isValid;
    } catch (error) {
      console.error('❌ Query validation error:', error);
      return false;
    }
  }

  // Filter content before sending to LLM
  filterInput(text) {
    try {
      // First sanitize harmful content
      let filtered = this.sanitizeText(text);

      // Truncate if too long (to prevent prompt injection)
      if (filtered.length > 2000) {
        filtered = filtered.substring(0, 2000) + '...';
        console.log('✂️ Text truncated for safety');
      }

      return filtered;
    } catch (error) {
      console.error('❌ Input filtering error:', error);
      return text;
    }
  }

  // Validate LLM output for safety
  validateOutput(response) {
    try {
      if (!response || response.trim().length === 0) {
        return {
          isValid: false,
          reason: 'Empty response'
        };
      }

      // Check for harmful patterns in response
      const hasHarmfulContent = this.harmfulPatterns.some(pattern => 
        pattern.test(response)
      );

      if (hasHarmfulContent) {
        return {
          isValid: false,
          reason: 'Response contains harmful content'
        };
      }

      // Check if response stays in healthcare domain
      const lowerResponse = response.toLowerCase();
      const hasHealthcareContext = this.healthcareKeywords.some(keyword => 
        lowerResponse.includes(keyword)
      ) || lowerResponse.includes('medication') || lowerResponse.includes('health');

      return {
        isValid: hasHealthcareContext,
        reason: hasHealthcareContext ? 'Valid healthcare response' : 'Response outside healthcare domain'
      };
    } catch (error) {
      console.error('❌ Output validation error:', error);
      return {
        isValid: false,
        reason: 'Validation error'
      };
    }
  }

  // Add medical disclaimer to responses
  addMedicalDisclaimer(response) {
    const disclaimer = "\n\n⚠️ This information is for general guidance only. Always consult your healthcare provider for medical advice.";
    return response + disclaimer;
  }
}

module.exports = new ContentSafetyService();
