from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EmployeeBase(BaseModel):
    name: str
    emp_id: str
    email: Optional[str] = None
    department: Optional[str] = None
    github_username: Optional[str] = None
    jira_account_id: Optional[str] = None
    role: Optional[str] = "engineer"
    avatar_url: Optional[str] = None
    gh_token: Optional[str] = None
    gh_owner: Optional[str] = None
    gh_repo: Optional[str] = None
    jira_token: Optional[str] = None
    jira_email: Optional[str] = None
    jira_domain: Optional[str] = None
    jira_project: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    emp_id: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    github_username: Optional[str] = None
    jira_account_id: Optional[str] = None
    role: Optional[str] = None
    avatar_url: Optional[str] = None
    gh_token: Optional[str] = None
    gh_owner: Optional[str] = None
    gh_repo: Optional[str] = None
    jira_token: Optional[str] = None
    jira_email: Optional[str] = None
    jira_domain: Optional[str] = None
    jira_project: Optional[str] = None

class Employee(EmployeeBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
