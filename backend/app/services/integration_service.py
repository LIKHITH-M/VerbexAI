from prisma import Prisma
from .github_service import create_github_issue, check_duplicate_issue, get_github_issue_status, trigger_github_action
from .jira_service import create_jira_ticket, get_jira_ticket_status
from datetime import datetime
from ..config import settings

async def push_task_to_integrations(
    task_id: str,
    db: Prisma,
    push_github: bool = True,
    push_jira: bool = True,
) -> dict:
    # Fetch task with meeting and employee
    task = await db.task.find_unique(
        where={"id": task_id},
        include={"meeting": True, "employee": True}
    )
    
    if not task:
        return {"success": False, "error": "Task not found"}

    results = {
        "task_id": str(task.id),
        "task_title": task.title,
        "assignee_name": task.assignee_name,
        "github": None,
        "jira": None,
    }

    meeting_title = task.meeting.title if task.meeting else ""
    priority_str = task.priority
    
    # 1. Fetch Default Credentials from Settings
    emp_id = task.employee.emp_id if task.employee else "EMP001"
    settings_creds = settings.get_employee_credentials(emp_id)

    # 2. Fetch Employee Record for Database Credentials
    target_employee = task.employee
    emp_data = {}
    
    if not target_employee:
        # Try to find any employee with credentials as a master fallback
        employees = await db.query_raw(
            "SELECT * FROM employees WHERE gh_token IS NOT NULL OR jira_token IS NOT NULL LIMIT 1"
        )
        if employees:
            emp_data = employees[0]
    else:
        emp_records = await db.query_raw("SELECT * FROM employees WHERE id = $1", target_employee.id)
        if emp_records:
            emp_data = emp_records[0]

    # 3. Merge Credentials (DB takes priority, then employee settings, then default settings)
    creds = {
        "gh_token": emp_data.get("gh_token") or settings_creds.get("gh_token") or settings.GITHUB_TOKEN,
        "gh_owner": emp_data.get("gh_owner") or settings_creds.get("gh_owner") or settings.GITHUB_REPO_OWNER,
        "gh_repo": emp_data.get("gh_repo") or settings_creds.get("gh_repo") or settings.GITHUB_REPO_NAME,
        "jira_email": emp_data.get("jira_email") or settings_creds.get("jira_email") or settings.JIRA_EMAIL,
        "jira_token": emp_data.get("jira_token") or settings_creds.get("jira_token") or settings.JIRA_API_TOKEN,
        "jira_domain": emp_data.get("jira_domain") or settings_creds.get("jira_domain") or settings.JIRA_DOMAIN,
        "jira_project": emp_data.get("jira_project") or settings_creds.get("jira_project") or settings.JIRA_PROJECT_KEY,
    }

    github_user = emp_data.get("github_username")
    jira_id = emp_data.get("jira_account_id")

    if push_github and creds["gh_token"]:
        github_result = await create_github_issue(
            task_title=task.title,
            task_description=task.description or "",
            source_quote=task.source_quote or "",
            meeting_title=meeting_title,
            priority=priority_str,
            github_username=github_user,
            assignee_name=task.assignee_name,
            repo_owner=creds["gh_owner"],
            repo_name=creds["gh_repo"],
            token=creds["gh_token"],
        )
        if github_result["success"]:
            await trigger_github_action(
                repo_owner=creds["gh_owner"],
                repo_name=creds["gh_repo"],
                token=creds["gh_token"]
            )
            await db.task.update(
                where={"id": task_id},
                data={
                    "github_issue_url": github_result["issue_url"], 
                    "status": "approved"
                }
            )
        results["github"] = github_result

    if push_jira and creds["jira_token"]:
        # Resolve Jira Account ID if needed
        real_jira_id = jira_id
        if jira_id and "@" in jira_id:
            from .jira_service import get_jira_account_id
            resolved_id = await get_jira_account_id(
                email=jira_id,
                jira_domain=creds["jira_domain"],
                jira_email=creds["jira_email"],
                jira_token=creds["jira_token"]
            )
            if resolved_id:
                real_jira_id = resolved_id
        
        jira_result = await create_jira_ticket(
            task_title=task.title,
            task_description=task.description or "",
            source_quote=task.source_quote or "",
            meeting_title=meeting_title,
            priority=priority_str,
            jira_account_id=real_jira_id,
            assignee_name=task.assignee_name,
            jira_domain=creds["jira_domain"],
            jira_email=creds["jira_email"],
            jira_token=creds["jira_token"],
            jira_project_key=creds["jira_project"],
        )
        if jira_result["success"]:
            await db.task.update(
                where={"id": task_id},
                data={
                    "jira_issue_key": jira_result["issue_key"], 
                    "status": "approved"
                }
            )
        results["jira"] = jira_result

    return results

async def sync_all_task_statuses(meeting_id: str, db: Prisma):
    """Fetch real-time status from GitHub/Jira and update local Task records"""
    # Use query_raw to fetch columns that might not be in the client model
    tasks = await db.query_raw(
        "SELECT * FROM tasks WHERE meeting_id = $1 AND (github_issue_url IS NOT NULL OR jira_issue_key IS NOT NULL)",
        meeting_id
    )

    sync_results = []
    for task_data in tasks:
        task_id = task_data["id"]
        github_issue_url = task_data.get("github_issue_url")
        jira_issue_key = task_data.get("jira_issue_key")
        
        # --- DYNAMIC CREDENTIAL FETCH ---
        emp_id = task_data.get("owner_emp_id") or "EMP001"
        settings_creds = settings.get_employee_credentials(emp_id)
        
        # Fetch actual employee data if available
        emp_data = {}
        if task_data.get("employee_id"):
           emp_records = await db.query_raw("SELECT * FROM employees WHERE id = $1", task_data["employee_id"])
           if emp_records:
               emp_data = emp_records[0]

        creds = {
            "gh_token": emp_data.get("gh_token") or settings_creds.get("gh_token"),
            "gh_owner": emp_data.get("gh_owner") or settings_creds.get("gh_owner"),
            "gh_repo": emp_data.get("gh_repo") or settings_creds.get("gh_repo"),
            "jira_email": emp_data.get("jira_email") or settings_creds.get("jira_email"),
            "jira_token": emp_data.get("jira_token") or settings_creds.get("jira_token"),
            "jira_domain": emp_data.get("jira_domain") or settings_creds.get("jira_domain"),
            "jira_project": emp_data.get("jira_project") or settings_creds.get("jira_project"),
        }
        
        new_status = None
        
        # 1. Sync GitHub Status
        if github_issue_url and creds["gh_token"]:
            try:
                issue_num = int(github_issue_url.split("/")[-1])
                github_data = await get_github_issue_status(
                    issue_number=issue_num,
                    repo_owner=creds["gh_owner"],
                    repo_name=creds["gh_repo"],
                    token=creds["gh_token"]
                )
                github_state = github_data.get("state") if github_data else None
                
                if github_state == "closed":
                    new_status = "completed"
                elif github_state == "in_progress":
                    new_status = "in_progress"
            except Exception as e:
                print(f"GH SYNC ERR for {task_id}: {e}")

        # 2. Sync Jira Status
        if jira_issue_key and creds["jira_token"]:
            try:
                jira_status = await get_jira_ticket_status(
                    issue_key=jira_issue_key,
                    jira_domain=creds["jira_domain"],
                    jira_email=creds["jira_email"],
                    jira_token=creds["jira_token"]
                )
                if jira_status in ["Done", "Resolved", "Closed", "Complete"]:
                    new_status = "completed"
                elif jira_status in ["In Progress", "In Dev", "In Review"]:
                    new_status = "in_progress"
                elif jira_status in ["To Do", "Backlog", "Open"]:
                    new_status = "approved"
            except Exception as e:
                print(f"JIRA SYNC ERR for {task_id}: {e}")

        if new_status and new_status != task_data.get("status"):
            await db.task.update(
                where={"id": task_id},
                data={"status": new_status}
            )
            sync_results.append({"task_id": task_id, "status": new_status})

    # Recalculate and update meeting health score after sync
    if sync_results:
        all_tasks = await db.task.find_many(where={"meeting_id": meeting_id})
        if all_tasks:
            approved_completed = len([t for t in all_tasks if t.status in ["approved", "completed"]])
            new_health = round((approved_completed / len(all_tasks)) * 100)
            await db.meeting.update(
                where={"id": meeting_id},
                data={"health_score": float(new_health)}
            )

    return sync_results
async def push_all_approved_tasks(meeting_id: str, db: Prisma) -> list:
    tasks = await db.task.find_many(
        where={
            "meeting_id": meeting_id,
            "status": {
                "in": ["approved", "pending_review"]
            }
        }
    )

    results = []
    for task in tasks:
        result = await push_task_to_integrations(
            task_id=task.id,
            db=db,
            push_github=True,
            push_jira=True,
        )
        results.append(result)

    return results
