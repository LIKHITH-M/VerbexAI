from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from prisma.enums import TaskStatus, Priority

from .employee import Employee

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Priority
    assignee_name: Optional[str] = None
    owner_emp_id: Optional[str] = None
    owner_dept: Optional[str] = None
    source_quote: Optional[str] = None

class TaskCreate(TaskBase):
    meeting_id: str
    status: TaskStatus = "pending_review"
    confidence_score: float

class Task(TaskBase):
    id: str
    meeting_id: str
    employee_id: Optional[str] = None
    employee: Optional[Employee] = None
    status: TaskStatus
    confidence_score: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
