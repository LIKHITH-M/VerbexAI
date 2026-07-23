from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ..database import Base

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"))
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    decided_by_name = Column(String(255), nullable=True)
    source_quote = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
