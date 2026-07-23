from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.database import db
from app.schemas.employee import Employee, EmployeeCreate, EmployeeUpdate
from prisma.models import Employee as PrismaEmployee

router = APIRouter(prefix="/employees", tags=["employees"])

async def auto_map_tasks_for_employee(emp_record: PrismaEmployee):
    """
    Automatically maps any unmapped tasks matching the employee's name or emp_id.
    Sets employee_id, updates status to 'approved', and elevates confidence score to 0.90.
    """
    if not emp_record:
        return
    
    emp_id = emp_record.id
    emp_code = emp_record.emp_id
    emp_name = emp_record.name
    emp_dept = emp_record.department or "Engineering"
    
    first_name = emp_name.split()[0] if emp_name else ""

    unmapped_tasks = await db.task.find_many(where={"employee_id": None})

    matched_task_ids = []
    affected_meeting_ids = set()

    for task in unmapped_tasks:
        name_match = False
        
        # Check direct assignee_name match
        if task.assignee_name and task.assignee_name.lower() != "unassigned":
            if task.assignee_name.lower() in emp_name.lower() or emp_name.lower() in task.assignee_name.lower():
                name_match = True

        # Check description, source_quote, and title for "Originally mentioned: John Doe" or name match
        full_text = f"{task.title or ''} {task.description or ''} {task.source_quote or ''}".lower()
        if not name_match and emp_name and emp_name.lower() in full_text:
            name_match = True
        elif not name_match and first_name and len(first_name) > 2 and f"mentioned: {first_name.lower()}" in full_text:
            name_match = True
        elif not name_match and first_name and len(first_name) > 2 and first_name.lower() in full_text:
            name_match = True
        
        emp_id_match = task.owner_emp_id and (task.owner_emp_id.lower() == emp_code.lower())

        if name_match or emp_id_match:
            matched_task_ids.append(task.id)
            if task.meeting_id:
                affected_meeting_ids.add(task.meeting_id)

    if matched_task_ids:
        # ONLY elevate status to 'approved' and confidence to 0.90 IF github_username is provided!
        # If github_username is missing, keep status as 'pending_review' so it stays in Gate 2!
        target_status = "approved" if emp_record.github_username else "pending_review"
        target_confidence = 0.90 if emp_record.github_username else 0.65

        for tid in matched_task_ids:
            await db.task.update(
                where={"id": tid},
                data={
                    "employee_id": emp_id,
                    "assignee_name": emp_name,
                    "owner_emp_id": emp_code,
                    "owner_dept": emp_dept,
                    "status": target_status,
                    "confidence_score": target_confidence
                }
            )
        
        for mid in affected_meeting_ids:
            all_m_tasks = await db.task.find_many(where={"meeting_id": mid})
            if all_m_tasks:
                approved_count = len([t for t in all_m_tasks if t.status in ["approved", "completed"]])
                new_health = round((approved_count / len(all_m_tasks)) * 100)
                await db.meeting.update(
                    where={"id": mid},
                    data={"health_score": float(new_health)}
                )

@router.get("/", response_model=List[Employee])
async def get_employees():
    return await db.employee.find_many()

@router.post("/", response_model=Employee, status_code=201)
async def create_employee(employee: EmployeeCreate):
    # Check if emp_id already exists
    existing = await db.employee.find_unique(where={"emp_id": employee.emp_id})
    if existing:
        raise HTTPException(status_code=400, detail=f"Employee ID {employee.emp_id} already exists")
    
    created = await db.employee.create(data=employee.dict())
    await auto_map_tasks_for_employee(created)
    return created

@router.post("/auto-map-all")
async def trigger_auto_map_all():
    employees = await db.employee.find_many()
    for emp in employees:
        await auto_map_tasks_for_employee(emp)
    return {"status": "success", "message": "All unmapped tasks checked and mapped to registered employees"}

@router.put("/{id}", response_model=Employee)
async def update_employee(id: str, employee_data: EmployeeUpdate):
    try:
        # Check if employee exists
        existing = await db.employee.find_unique(where={"id": id})
        if not existing:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        # Prepare data for update, filtering out None values
        update_data = {k: v for k, v in employee_data.dict().items() if v is not None}
        
        # If emp_id is being updated, check for conflicts
        if "emp_id" in update_data and update_data["emp_id"] != existing.emp_id:
            conflict = await db.employee.find_unique(where={"emp_id": update_data["emp_id"]})
            if conflict:
                raise HTTPException(status_code=400, detail=f"Employee ID {update_data['emp_id']} already exists")
        
        updated = await db.employee.update(
            where={"id": id},
            data=update_data
        )
        await auto_map_tasks_for_employee(updated)
        return updated
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auto-map-all")
async def trigger_auto_map_all():
    employees = await db.employee.find_many()
    for emp in employees:
        await auto_map_tasks_for_employee(emp)
    return {"status": "success", "message": "All unmapped tasks checked and mapped to registered employees"}

@router.delete("/{id}", status_code=204)
async def delete_employee(id: str):
    try:
        await db.employee.delete(where={"id": id})
    except:
        raise HTTPException(status_code=404, detail="Employee not found")
