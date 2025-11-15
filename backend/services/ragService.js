const pdf = require('pdf-parse');

class RAGService {
  constructor() {
    this.documents = new Map(); // In-memory storage: userId -> documents
    this.hfToken = process.env.HUGGINGFACE_API_KEY;
    console.log('🚀 RAG Service initialized (in-memory mode)');
  }

  // Extract text from PDF buffer
  async extractTextFromPDF(pdfBuffer) {
    try {
      const data = await pdf(pdfBuffer);
      console.log('📄 PDF text extracted:', data.text.substring(0, 200) + '...');
      return data.text;
    } catch (error) {
      console.error('❌ PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  // Split text into chunks for better context
  chunkText(text, chunkSize = 500, overlap = 100) {
    const chunks = [];
    let start = 0;
    
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end);
      
      if (chunk.trim()) {
        chunks.push({
          text: chunk.trim(),
          start,
          end,
          length: chunk.length
        });
      }
      
      start = end - overlap;
    }
    
    console.log(`📝 Text split into ${chunks.length} chunks`);
    return chunks;
  }

  // Generate embeddings using Hugging Face Inference API
  async generateEmbeddings(chunks) {
    try {
      const embeddings = [];
      
      for (const chunk of chunks) {
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (this.hfToken) {
          headers['Authorization'] = `Bearer ${this.hfToken}`;
        }
        
        const response = await fetch('https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            inputs: chunk.text,
            options: { wait_for_model: true }
          })
        });
        
        if (!response.ok) {
          if (response.status === 503) {
            console.log('⏳ Model loading, waiting 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue; // Retry this chunk
          }
          throw new Error(`HuggingFace API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        let embedding;
        if (Array.isArray(result) && Array.isArray(result[0])) {
          embedding = result[0];
        } else if (Array.isArray(result)) {
          embedding = result;
        } else {
          throw new Error('Unexpected embedding format');
        }
        
        embeddings.push({
          ...chunk,
          embedding
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log(`🧠 Generated ${embeddings.length} embeddings using HuggingFace`);
      return embeddings;
    } catch (error) {
      console.error('❌ Embedding generation error:', error);
      throw new Error('Failed to generate embeddings with HuggingFace');
    }
  }

  // Store embeddings in memory
  async storeInVectorDB(userId, embeddings, metadata = {}) {
    try {
      if (!this.documents.has(userId)) {
        this.documents.set(userId, []);
      }
      
      const userDocs = this.documents.get(userId);
      
      for (let i = 0; i < embeddings.length; i++) {
        const emb = embeddings[i];
        userDocs.push({
          id: `${userId}-chunk-${userDocs.length}`,
          userId,
          text: emb.text,
          embedding: emb.embedding,
          chunkIndex: i,
          ...metadata
        });
      }
      
      console.log(`💾 Stored ${embeddings.length} vectors for user ${userId} in memory`);
      return embeddings.length;
    } catch (error) {
      console.error('❌ Vector storage error:', error);
      throw new Error('Failed to store in vector database');
    }
  }

  // Simple cosine similarity function
  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Retrieve relevant context based on query
  async retrieveContext(userId, query, topK = 3) {
    try {
      if (!this.documents.has(userId)) {
        console.log(`📭 No documents found for user ${userId}`);
        return [];
      }
      
      // Generate embedding for the query
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (this.hfToken) {
        headers['Authorization'] = `Bearer ${this.hfToken}`;
      }
      
      const response = await fetch('https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inputs: query,
          options: { wait_for_model: true }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`);
      }
      
      const result = await response.json();
      let queryEmbedding;
      
      if (Array.isArray(result) && Array.isArray(result[0])) {
        queryEmbedding = result[0];
      } else if (Array.isArray(result)) {
        queryEmbedding = result;
      } else {
        throw new Error('Unexpected embedding format');
      }
      
      // Calculate similarities with all user documents
      const userDocs = this.documents.get(userId);
      const similarities = userDocs.map(doc => ({
        ...doc,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding)
      }));
      
      // Sort by similarity and take top K
      similarities.sort((a, b) => b.score - a.score);
      const topResults = similarities.slice(0, topK);
      
      const context = topResults.map(doc => ({
        text: doc.text,
        score: doc.score
      }));

      console.log(`🔍 Retrieved ${context.length} relevant chunks for query: "${query}"`);
      return context;
    } catch (error) {
      console.error('❌ Context retrieval error:', error);
      return [];
    }
  }

  // Complete RAG pipeline: PDF → Vector DB
  async processPDF(userId, pdfBuffer, metadata = {}) {
    try {
      console.log(`🚀 Starting RAG pipeline for user ${userId}`);
      
      // Step 1: Extract text
      const text = await this.extractTextFromPDF(pdfBuffer);
      
      // Step 2: Chunk text
      const chunks = this.chunkText(text);
      
      // Step 3: Generate embeddings
      const embeddings = await this.generateEmbeddings(chunks);
      
      // Step 4: Store in vector DB
      const vectorCount = await this.storeInVectorDB(userId, embeddings, metadata);
      
      console.log(`✅ RAG pipeline complete: ${vectorCount} vectors stored`);
      
      return {
        success: true,
        vectorCount,
        textLength: text.length,
        chunkCount: chunks.length
      };
    } catch (error) {
      console.error('❌ RAG pipeline error:', error);
      throw error;
    }
  }
}

module.exports = new RAGService();
