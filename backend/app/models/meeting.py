from sqlalchemy import Column, String, Text, Enum, Float, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..database import Base
import enum

class MeetingStatus(str, enum.Enum):
    pending = "pending"
    transcribing = "transcribing"
    processing = "processing"
    complete = "complete"
    failed = "failed"

class InputType(str, enum.Enum):
    uploaded_audio = "uploaded_audio"
    text = "text"
    live_audio = "live_audio"

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    host_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(MeetingStatus), default=MeetingStatus.pending)
    input_type = Column(Enum(InputType), nullable=True)
    raw_file_path = Column(String, nullable=True)
    raw_transcript = Column(Text, nullable=True)
    cleaned_transcript = Column(Text, nullable=True)
    tldr = Column(Text, nullable=True)
    health_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
