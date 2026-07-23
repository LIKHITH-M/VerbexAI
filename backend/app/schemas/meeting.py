from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from prisma.enums import MeetingStatus, InputType

class MeetingBase(BaseModel):
    title: str
    host_name: str
    description: Optional[str] = None

class MeetingCreate(MeetingBase):
    pass

class MeetingUpdate(BaseModel):
    status: Optional[MeetingStatus] = None
    input_type: Optional[InputType] = None
    raw_transcript: Optional[str] = None
    cleaned_transcript: Optional[str] = None
    tldr: Optional[str] = None
    health_score: Optional[float] = None
    processed_at: Optional[datetime] = None

from .task import Task
from .decision import Decision

class Meeting(MeetingBase):
    id: str
    status: MeetingStatus
    input_type: Optional[InputType] = None
    raw_transcript: Optional[str] = None
    cleaned_transcript: Optional[str] = None
    tldr: Optional[str] = None
    health_score: Optional[float] = None
    created_at: datetime
    processed_at: Optional[datetime] = None
    
    task_count: Optional[int] = 0
    decision_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class MeetingWithResults(Meeting):
    tasks: List[Task] = []
    decisions: List[Decision] = []
