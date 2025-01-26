#!/bin/bash

curl -X POST http://localhost:3001/api/test/extract-test \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Moderna",
    "html": "<div id=\"about\">Moderna is pioneering mRNA therapeutics and vaccines to create a new generation of medicines.</div><section class=\"pipeline\">Phase 3 clinical trial for mRNA-1273 COVID-19 vaccine. Phase 2 studies in oncology.</section><div class=\"research\">Leveraging mRNA platform with lipid nanoparticles.</div>"
  }'
