"""
Preprocessing Pipeline
======================
Steps:
1. Emoji demojization  ("I'm 😡" → "I'm angry_face")
2. Lowercase + strip
3. spaCy lemmatization + stopword removal
4. TF-IDF vectorization
5. (Optional) CuPy conversion for GPU inference
"""
import re
import emoji
import joblib
import numpy as np
from pathlib import Path

import functools

# Lazy-load spaCy model to avoid startup overhead
_nlp = None

def _get_nlp():
    global _nlp
    if _nlp is None:
        import spacy
        try:
            # Minimized pipeline for maximum speed: only enable lemmatizer
            _nlp = spacy.load("en_core_web_sm", enable=["lemmatizer"])
            # The lemmatizer in en_core_web_sm 3.x usually requires attribute_ruler or tagger
            # but we can try just enabling lemmatizer or checking if it exists.
            if "lemmatizer" not in _nlp.pipe_names:
                _nlp.add_pipe("lemmatizer", config={"mode": "rule"})
        except OSError:
            raise RuntimeError(
                "spaCy model not found. Run: python -m spacy download en_core_web_sm"
            )
    return _nlp

def demojize_text(text: str) -> str:
    """Convert emoji to text literals with underscores."""
    import emoji
    return emoji.demojize(text, delimiters=(" ", " "))

def lemmatize(text: str) -> str:
    """Lowercase, lemmatize, and remove stopwords + punctuation."""
    nlp = _get_nlp()
    doc = nlp(text.lower())
    tokens = [
        token.lemma_
        for token in doc
        if not token.is_stop and not token.is_punct and token.is_alpha
    ]
    return " ".join(tokens)

@functools.lru_cache(maxsize=1024)
def clean_text(text: str) -> str:
    """Full preprocessing with LRU caching for performance."""
    text = demojize_text(text)
    text = lemmatize(text)
    return text


class Preprocessor:
    """
    Loads a fitted TF-IDF vectorizer and transforms raw text into
    a feature matrix ready for SVM inference.
    """

    def __init__(self, tfidf_path: str):
        self.vectorizer = joblib.load(tfidf_path)

    def transform(self, text: str) -> np.ndarray:
        cleaned = clean_text(text)
        vector = self.vectorizer.transform([cleaned])
        return vector

    def transform_to_gpu(self, text: str):
        """
        Converts sparse sklearn matrix to CuPy dense array for GPU inference.
        Requires: pip install cupy-cuda12x
        """
        try:
            import cupy as cp
            vector = self.transform(text)
            return cp.array(vector.toarray(), dtype=cp.float32)
        except ImportError:
            # Graceful fallback: return numpy dense array
            return self.transform(text).toarray()
