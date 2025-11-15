const pdf = require('pdf-parse');
const contentSafety = require('./contentSafety');

class RAGService {
  constructor() {
    this.documents = new Map(); // In-memory storage: userId -> PDF text
    console.log('🚀 RAG Service initialized (simple text storage)');
  }

  // Extract text from PDF buffer
  async extractTextFromPDF(pdfBuffer) {
    try {
      const data = await pdf(pdfBuffer);
      const extractedText = data.text;
      
      console.log('📄 PDF text extracted:', extractedText.substring(0, 200) + '...');
      
      // Validate PDF content is medical-related
      const validation = contentSafety.validatePDFContent(extractedText);
      if (!validation.isValid) {
        throw new Error(`PDF validation failed: ${validation.reason}`);
      }
      
      // Sanitize the extracted text
      const sanitizedText = contentSafety.sanitizeText(extractedText);
      console.log('🛡️ PDF text validated and sanitized');
      
      return sanitizedText;
    } catch (error) {
      console.error('❌ PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  // Store PDF text directly (no embeddings needed)
  async storePDFText(userId, pdfText, metadata = {}) {
    try {
      if (!this.documents.has(userId)) {
        this.documents.set(userId, []);
      }
      
      const userDocs = this.documents.get(userId);
      userDocs.push({
        id: `${userId}-pdf-${userDocs.length}`,
        userId,
        text: pdfText,
        uploadDate: new Date().toISOString(),
        ...metadata
      });
      
      console.log(`💾 Stored PDF text for user ${userId} (${pdfText.length} characters)`);
      return 1; // Return count of documents stored
    } catch (error) {
      console.error('❌ PDF storage error:', error);
      throw new Error('Failed to store PDF text');
    }
  }

  // Retrieve all PDF text for a user (no similarity search needed)
  async retrieveContext(userId, query = '') {
    try {
      if (!this.documents.has(userId)) {
        console.log(`📭 No documents found for user ${userId}`);
        return [];
      }
      
      // Validate query is healthcare-related (optional since we're returning all context)
      if (query && !contentSafety.isHealthcareQuery(query)) {
        console.log(`🚫 Non-healthcare query blocked: "${query}"`);
        return [];
      }
      
      const userDocs = this.documents.get(userId);
      const context = userDocs.map(doc => ({
        text: doc.text,
        filename: doc.filename || 'prescription.pdf',
        uploadDate: doc.uploadDate
      }));

      console.log(`🔍 Retrieved ${context.length} PDF documents for user ${userId}`);
      return context;
    } catch (error) {
      console.error('❌ Context retrieval error:', error);
      return [];
    }
  }

  // Simple PDF processing: Extract → Validate → Store
  async processPDF(userId, pdfBuffer, metadata = {}) {
    try {
      console.log(`🚀 Starting simple PDF processing for user ${userId}`);
      
      // Step 1: Extract and validate text
      const text = await this.extractTextFromPDF(pdfBuffer);
      
      // Step 2: Store text directly
      const docCount = await this.storePDFText(userId, text, metadata);
      
      console.log(`✅ PDF processing complete: ${docCount} document stored`);
      
      return {
        success: true,
        vectorCount: docCount, // Keep same interface
        textLength: text.length,
        chunkCount: 1 // Single document
      };
    } catch (error) {
      console.error('❌ PDF processing error:', error);
      throw error;
    }
  }
}

module.exports = new RAGService();
