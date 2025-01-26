#!/bin/bash

echo "Running extractor tests..."

format_json() {
    echo "$1" | python -m json.tool
}

# Test 1: Basic Company Info
echo -e "\n1. Testing basic company info extraction..."
RESULT=$(curl -s -X POST http://localhost:3001/api/test/extract-test \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "html": "<div class=\"about\">Test Company, founded 2020. 500+ employees. Headquartered in Cambridge, MA.</div><div class=\"contact\">Contact: info@testcompany.com</div>"
  }')
echo "Basic Info Results:"
format_json "$RESULT"

# Test 2: Biotech Specific
echo -e "\n2. Testing biotech-specific extraction..."
RESULT=$(curl -s -X POST http://localhost:3001/api/test/extract-test \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Biotech Corp",
    "html": "<div class=\"pipeline\">Phase 2 trial in oncology using mRNA platform with lipid nanoparticle delivery.</div><div class=\"research\">Developing novel therapeutics for HER2+ breast cancer.</div>"
  }')
echo "Biotech Results:"
format_json "$RESULT"

# Test 3: Full Company Profile
echo -e "\n3. Testing full company profile..."
RESULT=$(curl -s -X POST http://localhost:3001/api/test/extract-test \
  -H "Content-Type: application/json" \
  -d @test-payload.json)
echo "Full Profile Results:"
format_json "$RESULT"

echo -e "\nTests complete."
