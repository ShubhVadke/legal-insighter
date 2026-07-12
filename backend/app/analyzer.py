import os
import json
from openai import OpenAI

def analyze_legal_text(raw_text: str) -> dict:
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("Bhai, GROQ_API_KEY .env file mein nahi mili!")
    
    client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=groq_api_key
    )
    
    prompt = f"""You are an expert legal advisor who explains complex contracts to common non-tech people (ELI5).
Analyze the following legal document text and return the output STRICTLY as a valid JSON object. Do not include any conversational filler, intro, or markdown formatting (like ```json). Just the raw JSON object.

The JSON must exactly follow this schema: {{
  "summary": ["point 1", "point 2"],
  "red_flags": [
    {{"clause": "problematic sentence from text", "severity": "HIGH/MEDIUM/LOW", "reason": "explanation in English"}},
    {{"clause": "another sentence", "severity": "HIGH/MEDIUM/LOW", "reason": "explanation in English"}}
  ],
  "financial_impact": "explanation of money, penalties, or deposits in English"
}}

Note: Keep the 'reason' and 'financial_impact' fields highly accessible, friendly, and written in 'English'.

Document Text:
{raw_text}"""

    try:
        # 🔥 FIXED MODEL NAME FOR 2026
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant", 
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        response_text = response.choices[0].message.content.strip()
        return json.loads(response_text)
        
    except json.JSONDecodeError:
        return {
            "summary": ["Document load ho gaya hai par structure fail hua."],
            "red_flags": [{"clause": "N/A", "severity": "LOW", "reason": "AI broken response format. Please try again."}],
            "financial_impact": "Format parsing error."
        }
    except Exception as e:
        raise Exception(f"Groq API Error: {str(e)}")