from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class DecisionBase(BaseModel):
    title: str
    description: Optional[str] = None
    decided_by_name: Optional[str] = None
    source_quote: Optional[str] = None

class DecisionCreate(DecisionBase):
    meeting_id: str

class Decision(DecisionBase):
    id: str
    meeting_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
