import csv
import os
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session

import crud
from auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    hash_password,
    require_admin,
    verify_password,
)
from database import Base, engine, get_db
from models import Category, Item, Setting, StockIn, StockOut, Supplier, User
from schemas import (
    ChangePasswordRequest,
    ItemBase,
    LoginRequest,
    ProfileUpdate,
    SettingsBase,
    StockInBase,
    StockOutBase,
    Token,
    UserCreate,
    UserUpdate,
)

UPLOAD_ROOT = Path("uploads")
for folder in [UPLOAD_ROOT / "profile", UPLOAD_ROOT / "items", UPLOAD_ROOT / "settings"]:
    folder.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="School Stock Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_seed():
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        db.add(
            User(
                username="admin",
                full_name="System Admin",
                email="admin@school.local",
                hashed_password=hash_password("admin123"),
                role="Admin",
                status="Active",
            )
        )
    setting = db.query(Setting).first()
    if not setting:
        db.add(
            Setting(
                school_name="Demo School",
                school_address="School Street",
                school_phone="",
                school_email="",
            )
        )
    db.commit()
    db.close()


@app.get("/")
def root():
    return {"message": "School Stock Management API running"}


@app.get("/uploads/{folder}/{filename}")
def get_upload(folder: str, filename: str):
    path = UPLOAD_ROOT / folder / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)


@app.post("/auth/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.username, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username/password or inactive account")
    token = create_access_token({"sub": user.username})
    return {"access_token": token}


@app.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    setting = db.query(Setting).first()
    return {
        "user": current_user,
        "settings": setting,
    }


@app.put("/profile")
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.full_name = payload.full_name
    current_user.email = payload.email
    db.commit()
    db.refresh(current_user)
    return current_user


@app.post("/profile/upload")
def upload_profile_image(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ext = os.path.splitext(image.filename)[1]
    filename = f"user_{current_user.id}_{int(datetime.utcnow().timestamp())}{ext}"
    save_path = UPLOAD_ROOT / "profile" / filename
    with open(save_path, "wb") as f:
        f.write(image.file.read())
    current_user.profile_image = f"/uploads/profile/{filename}"
    db.commit()
    return {"profile_image": current_user.profile_image}


@app.post("/profile/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Password confirmation does not match")
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated"}


@app.get("/users")
def list_users(
    q: str = "",
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    data = db.query(User)
    if q:
        data = data.filter((User.username.contains(q)) | (User.full_name.contains(q)))
    return data.order_by(User.id.desc()).all()


@app.post("/users")
def create_user(payload: UserCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    existing = db.query(User).filter((User.username == payload.username) | (User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    user = User(
        username=payload.username,
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        status=payload.status,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.put("/users/{user_id}")
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        if field == "password" and value:
            user.hashed_password = hash_password(value)
        elif field != "password":
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


def simple_crud_routes(model, path_name: str):
    @app.get(f"/{path_name}")
    def list_entities(q: str = "", db: Session = Depends(get_db), __: User = Depends(get_current_user)):
        query = db.query(model)
        if q:
            if model == Category:
                query = query.filter(model.name.contains(q))
            elif model == Supplier:
                query = query.filter(model.name.contains(q))
        return query.order_by(model.id.desc()).all()

    @app.post(f"/{path_name}")
    def create_entity(payload: dict, db: Session = Depends(get_db), __: User = Depends(get_current_user)):
        entity = model(**payload)
        db.add(entity)
        db.commit()
        db.refresh(entity)
        return entity

    @app.get(f"/{path_name}/{{entity_id}}")
    def get_entity(entity_id: int, db: Session = Depends(get_db), __: User = Depends(get_current_user)):
        entity = db.query(model).filter(model.id == entity_id).first()
        if not entity:
            raise HTTPException(status_code=404, detail=f"{path_name[:-1].title()} not found")
        return entity

    @app.put(f"/{path_name}/{{entity_id}}")
    def update_entity(entity_id: int, payload: dict, db: Session = Depends(get_db), __: User = Depends(get_current_user)):
        entity = db.query(model).filter(model.id == entity_id).first()
        if not entity:
            raise HTTPException(status_code=404, detail=f"{path_name[:-1].title()} not found")
        for key, value in payload.items():
            setattr(entity, key, value)
        db.commit()
        db.refresh(entity)
        return entity

    @app.delete(f"/{path_name}/{{entity_id}}")
    def delete_entity(entity_id: int, db: Session = Depends(get_db), __: User = Depends(get_current_user)):
        entity = db.query(model).filter(model.id == entity_id).first()
        if not entity:
            raise HTTPException(status_code=404, detail=f"{path_name[:-1].title()} not found")
        db.delete(entity)
        db.commit()
        return {"message": "Deleted"}


simple_crud_routes(Category, "categories")
simple_crud_routes(Supplier, "suppliers")


@app.get("/items")
def list_items(
    q: str = "",
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Item)
    if q:
        query = query.filter(Item.name.contains(q))
    if category_id:
        query = query.filter(Item.category_id == category_id)
    return [crud.item_to_dict(i) for i in query.order_by(Item.id.desc()).all()]


@app.post("/items")
def create_item(payload: ItemBase, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = Item(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return crud.item_to_dict(item)


@app.get("/items/{item_id}")
def get_item(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return crud.item_to_dict(item)


@app.put("/items/{item_id}")
def update_item(item_id: int, payload: ItemBase, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return crud.item_to_dict(item)


@app.post("/items/{item_id}/upload")
def upload_item_image(
    item_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    ext = os.path.splitext(image.filename)[1]
    filename = f"item_{item_id}_{int(datetime.utcnow().timestamp())}{ext}"
    save_path = UPLOAD_ROOT / "items" / filename
    with open(save_path, "wb") as f:
        f.write(image.file.read())
    item.image = f"/uploads/items/{filename}"
    db.commit()
    return {"image": item.image}


@app.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}


@app.get("/stock-in")
def list_stock_in(
    q: str = "",
    item_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(StockIn)
    if item_id:
        query = query.filter(StockIn.item_id == item_id)
    if start_date:
        query = query.filter(StockIn.date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(StockIn.date <= datetime.fromisoformat(end_date + "T23:59:59"))
    rows = query.order_by(StockIn.date.desc()).all()
    if q:
        rows = [r for r in rows if r.item and q.lower() in r.item.name.lower()]
    return [
        {
            "id": r.id,
            "item_id": r.item_id,
            "item_name": r.item.name if r.item else "",
            "quantity_added": r.quantity_added,
            "date": r.date,
            "note": r.note,
        }
        for r in rows
    ]


@app.post("/stock-in")
def create_stock_in(payload: StockInBase, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Item).filter(Item.id == payload.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    entity = StockIn(**payload.model_dump())
    item.quantity += payload.quantity_added
    db.add(entity)
    db.commit()
    return {"message": "Stock in recorded"}


@app.put("/stock-in/{stock_id}")
def update_stock_in(stock_id: int, payload: StockInBase, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    stock = db.query(StockIn).filter(StockIn.id == stock_id).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock in not found")
    old_item = db.query(Item).filter(Item.id == stock.item_id).first()
    new_item = db.query(Item).filter(Item.id == payload.item_id).first()
    if not new_item:
        raise HTTPException(status_code=404, detail="Item not found")
    if old_item:
        old_item.quantity -= stock.quantity_added
    new_item.quantity += payload.quantity_added
    stock.item_id = payload.item_id
    stock.quantity_added = payload.quantity_added
    stock.date = payload.date
    stock.note = payload.note
    db.commit()
    return {"message": "Stock in updated"}


@app.delete("/stock-in/{stock_id}")
def delete_stock_in(stock_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    stock = db.query(StockIn).filter(StockIn.id == stock_id).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock in not found")
    item = db.query(Item).filter(Item.id == stock.item_id).first()
    if item:
        item.quantity = max(0, item.quantity - stock.quantity_added)
    db.delete(stock)
    db.commit()
    return {"message": "Stock in deleted"}


@app.get("/stock-out")
def list_stock_out(
    q: str = "",
    item_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(StockOut)
    if item_id:
        query = query.filter(StockOut.item_id == item_id)
    if start_date:
        query = query.filter(StockOut.date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(StockOut.date <= datetime.fromisoformat(end_date + "T23:59:59"))
    rows = query.order_by(StockOut.date.desc()).all()
    if q:
        rows = [r for r in rows if r.item and q.lower() in r.item.name.lower()]
    return [
        {
            "id": r.id,
            "item_id": r.item_id,
            "item_name": r.item.name if r.item else "",
            "quantity_removed": r.quantity_removed,
            "date": r.date,
            "purpose": r.purpose,
            "note": r.note,
        }
        for r in rows
    ]


@app.post("/stock-out")
def create_stock_out(payload: StockOutBase, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Item).filter(Item.id == payload.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if payload.quantity_removed > item.quantity:
        raise HTTPException(status_code=400, detail="Quantity not enough in stock")
    entity = StockOut(**payload.model_dump())
    item.quantity -= payload.quantity_removed
    db.add(entity)
    db.commit()
    return {"message": "Stock out recorded"}


@app.put("/stock-out/{stock_id}")
def update_stock_out(stock_id: int, payload: StockOutBase, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    stock = db.query(StockOut).filter(StockOut.id == stock_id).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock out not found")
    old_item = db.query(Item).filter(Item.id == stock.item_id).first()
    new_item = db.query(Item).filter(Item.id == payload.item_id).first()
    if not new_item:
        raise HTTPException(status_code=404, detail="Item not found")
    if old_item:
        old_item.quantity += stock.quantity_removed
    if payload.quantity_removed > new_item.quantity:
        raise HTTPException(status_code=400, detail="Quantity not enough in stock")
    new_item.quantity -= payload.quantity_removed
    stock.item_id = payload.item_id
    stock.quantity_removed = payload.quantity_removed
    stock.date = payload.date
    stock.purpose = payload.purpose
    stock.note = payload.note
    db.commit()
    return {"message": "Stock out updated"}


@app.delete("/stock-out/{stock_id}")
def delete_stock_out(stock_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    stock = db.query(StockOut).filter(StockOut.id == stock_id).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock out not found")
    item = db.query(Item).filter(Item.id == stock.item_id).first()
    if item:
        item.quantity += stock.quantity_removed
    db.delete(stock)
    db.commit()
    return {"message": "Stock out deleted"}


@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return crud.get_dashboard_stats(db)


@app.get("/reports")
def reports(
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    item_id: Optional[int] = Query(default=None),
    category_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    items_query = db.query(Item)
    if item_id:
        items_query = items_query.filter(Item.id == item_id)
    if category_id:
        items_query = items_query.filter(Item.category_id == category_id)
    items = items_query.all()

    stock_in_query = db.query(StockIn)
    stock_out_query = db.query(StockOut)
    if start_date:
        s = datetime.fromisoformat(start_date)
        stock_in_query = stock_in_query.filter(StockIn.date >= s)
        stock_out_query = stock_out_query.filter(StockOut.date >= s)
    if end_date:
        e = datetime.fromisoformat(end_date + "T23:59:59")
        stock_in_query = stock_in_query.filter(StockIn.date <= e)
        stock_out_query = stock_out_query.filter(StockOut.date <= e)
    if item_id:
        stock_in_query = stock_in_query.filter(StockIn.item_id == item_id)
        stock_out_query = stock_out_query.filter(StockOut.item_id == item_id)

    stock_in = stock_in_query.order_by(StockIn.date.desc()).all()
    stock_out = stock_out_query.order_by(StockOut.date.desc()).all()

    return {
        "summary": [crud.item_to_dict(i) for i in items],
        "stock_in": [
            {
                "id": s.id,
                "item_name": s.item.name if s.item else "",
                "quantity_added": s.quantity_added,
                "date": s.date,
                "note": s.note,
            }
            for s in stock_in
        ],
        "stock_out": [
            {
                "id": s.id,
                "item_name": s.item.name if s.item else "",
                "quantity_removed": s.quantity_removed,
                "date": s.date,
                "purpose": s.purpose,
                "note": s.note,
            }
            for s in stock_out
        ],
        "low_stock": [crud.item_to_dict(i) for i in items if i.quantity <= i.min_stock],
    }


@app.get("/reports/export-csv")
def report_csv(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = db.query(Item).all()
    output = []
    output.append(["Item", "Category", "Supplier", "Qty", "Min Stock", "Low Stock"])
    for i in rows:
        output.append([i.name, i.category.name if i.category else "", i.supplier.name if i.supplier else "", i.quantity, i.min_stock, "Yes" if i.quantity <= i.min_stock else "No"])

    def generate():
        for row in output:
            yield ",".join([str(cell) for cell in row]) + "\n"

    return StreamingResponse(generate(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=stock_report.csv"})


@app.get("/settings")
def get_settings(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Setting).first()


@app.put("/settings")
def update_settings(payload: SettingsBase, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    settings = db.query(Setting).first()
    for k, v in payload.model_dump().items():
        setattr(settings, k, v)
    db.commit()
    db.refresh(settings)
    return settings


@app.post("/settings/upload-logo")
def upload_school_logo(
    logo: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    settings = db.query(Setting).first()
    ext = os.path.splitext(logo.filename)[1]
    filename = f"school_logo_{int(datetime.utcnow().timestamp())}{ext}"
    save_path = UPLOAD_ROOT / "settings" / filename
    with open(save_path, "wb") as f:
        f.write(logo.file.read())
    settings.school_logo = f"/uploads/settings/{filename}"
    db.commit()
    return {"school_logo": settings.school_logo}
