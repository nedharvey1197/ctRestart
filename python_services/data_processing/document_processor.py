from typing import Dict, List
import spacy
from transformers import pipeline

class DocumentProcessor:
    def __init__(self):
        # Load SpaCy model for text processing
        self.nlp = spacy.load("en_core_web_sm")
        # Initialize transformer for document classification
        self.classifier = pipeline("zero-shot-classification")

    def process_document(self, text: str) -> Dict:
        """Process a single document and extract key information."""
        doc = self.nlp(text)
        
        return {
            "entities": self._extract_entities(doc),
            "key_phrases": self._extract_key_phrases(doc),
            "document_type": self._classify_document(text)
        }

    def _extract_entities(self, doc) -> List[Dict]:
        """Extract named entities from the document."""
        return [
            {"text": ent.text, "label": ent.label_}
            for ent in doc.ents
        ]

    def _extract_key_phrases(self, doc) -> List[str]:
        """Extract key phrases from the document."""
        return [
            chunk.text
            for chunk in doc.noun_chunks
            if len(chunk.text.split()) > 1
        ]

    def _classify_document(self, text: str) -> Dict:
        """Classify document type."""
        candidate_labels = [
            "clinical protocol",
            "regulatory document",
            "scientific publication",
            "patient data",
            "business report"
        ]
        
        result = self.classifier(
            text,
            candidate_labels,
            multi_label=True
        )
        
        return {
            "labels": result["labels"],
            "scores": result["scores"]
        } 