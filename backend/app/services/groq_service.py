from groq import AsyncGroq
import json
from ..config import settings
from .transcription import clean_transcript

def setup_groq():
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is missing")
    return AsyncGroq(api_key=settings.GROQ_API_KEY)

async def process_transcript_with_groq(transcript: str, meeting_title: str, host_name: str):
    client = setup_groq()
    
    cleaned_transcript = clean_transcript(transcript)
    
    system_prompt = f"""
You are an expert meeting analyst for engineering teams.
Read the transcript and extract all tasks and decisions precisely.
Meeting: {meeting_title}
Host: {host_name}

TASK = something someone must DO after this meeting ends
- Must have an action verb: fix, build, write, implement, review, update, create, test, deploy
- Must have an owner who committed to it or was assigned it
- Must be specific and bounded, not vague like "think about it"
- Priority HIGH = deadline mentioned, blocking others, or production issue
- Priority MEDIUM = important but no hard deadline
- Priority LOW = nice to have or future consideration

DECISION = something the group CONCLUDED and AGREED ON during the meeting
- Uses words like: decided, agreed, going with, confirmed, final call, approved, we will
- Already resolved — no further action needed from anyone
- Clearly different from a task — nobody needs to DO anything new

CONFIDENCE SCORE:
0.90-1.00 = named owner + clear specific action + explicit in transcript
0.75-0.89 = clear action + owner strongly implied from context
0.50-0.74 = action or owner is ambiguous — needs human review
0.00-0.49 = vague or speculative — will be discarded automatically

Return ONLY raw valid JSON. Zero markdown. Zero explanation. Zero preamble.
Exact structure:
{{
  "tldr": "one sentence capturing the single most important outcome",
  "health_score": <float 0 to 100>,
  "tasks": [
    {{
      "title": "<clear action title, under 10 words>",
      "description": "<1-2 sentences of context from the meeting>",
      "priority": "high or medium or low",
      "confidence_score": <float 0.0 to 1.0>,
      "assignee_name": "<full name of the person responsible, null if unknown>",
      "owner_emp_id": "<employee ID if mentioned (e.g. BE102), null if unknown>",
      "owner_dept": "<department name if mentioned (e.g. Backend Engineering), null if unknown>",
      "source_quote": "<exact words from transcript proving this task and ownership>"
    }}
  ],
  "decisions": [
    {{
      "title": "<clear decision title, under 10 words>",
      "description": "<1-2 sentences of what was decided and why>",
      "decided_by_name": "<name of person who announced or made the decision, null if group>",
      "source_quote": "<exact words from transcript proving this decision>"
    }}
  ]
}}
"""

    response = await client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": f"TRANSCRIPT:\n{cleaned_transcript}",
            }
        ],
        model=settings.GROQ_MODEL,
        response_format={"type": "json_object"}
    )
    
    content = response.choices[0].message.content
    print(f"DEBUG: Groq raw content: {content[:500]}...")
    
    try:
        data = json.loads(content)
        # Robust key checking
        if "tldr" not in data and "summary" in data:
            data["tldr"] = data["summary"]
        elif "tldr" not in data and "overview" in data:
            data["tldr"] = data["overview"]
            
        return data
    except json.JSONDecodeError:
        return {
            "tldr": "Failed to parse AI response",
            "health_score": 0,
            "tasks": [],
            "decisions": []
        }
