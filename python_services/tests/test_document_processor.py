import pytest
from data_processing.document_processor import DocumentProcessor

@pytest.fixture
def processor():
    return DocumentProcessor()

def test_document_processing():
    processor = DocumentProcessor()
    
    sample_text = """
    This Phase 3 clinical trial aims to evaluate the efficacy of Drug X 
    in treating advanced breast cancer patients. The study will be conducted 
    at Mayo Clinic and Johns Hopkins Hospital.
    """
    
    result = processor.process_document(sample_text)
    
    assert "entities" in result
    assert "key_phrases" in result
    assert "document_type" in result
    
    # Check if medical entities were detected
    entities = [e["text"] for e in result["entities"]]
    assert any("breast cancer" in e.lower() for e in entities)
    
    # Check document classification
    assert "clinical protocol" in result["document_type"]["labels"] 