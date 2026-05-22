"""
Local Knowledge Base Retriever
==============================
Performs semantic search on unstructured company policies using 
TF-IDF vector similarity. 100% API-free and optimized for CPU.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
from typing import List, Optional

class KBRetriever:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        self.chunks = []
        self.matrix = None

    def build_index(self, text: str):
        """Split text into overlapping chunks and build a TF-IDF index."""
        if not text or len(text.strip()) < 10:
            self.chunks = []
            self.matrix = None
            return

        # Split into sentences (basic regex)
        sentences = re.split(r'(?<=[.!?])\s+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 5]
        
        # Group sentences into chunks of ~3 sentences with 1 sentence overlap
        new_chunks = []
        chunk_size = 3
        overlap = 1
        
        for i in range(0, len(sentences), chunk_size - overlap):
            chunk = " ".join(sentences[i:i + chunk_size])
            if len(chunk) > 30:
                new_chunks.append(chunk)
        
        self.chunks = new_chunks
        
        if not self.chunks:
            self.matrix = None
            return

        self.matrix = self.vectorizer.fit_transform(self.chunks)

    def search(self, query: str, top_k: int = 1) -> List[str]:
        """Find the most relevant policy chunks for a query."""
        if self.matrix is None or not self.chunks:
            return []

        query_vec = self.vectorizer.transform([query.lower()])
        similarities = cosine_similarity(query_vec, self.matrix).flatten()
        
        # Get top indices
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        # Filter by a small threshold
        results = [
            self.chunks[i] 
            for i in top_indices 
            if similarities[i] > 0.1
        ]
        return results

# Global instance for app state
retriever = KBRetriever()
