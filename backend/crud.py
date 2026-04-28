from sqlalchemy import func
from sqlalchemy.orm import Session

from models import Category, Item, StockIn, StockOut, Supplier, User


def item_to_dict(item: Item):
    return {
        "id": item.id,
        "name": item.name,
        "category_id": item.category_id,
        "supplier_id": item.supplier_id,
        "quantity": item.quantity,
        "unit": item.unit,
        "min_stock": item.min_stock,
        "description": item.description,
        "image": item.image,
        "created_at": item.created_at,
        "category_name": item.category.name if item.category else "",
        "supplier_name": item.supplier.name if item.supplier else "",
    }


def get_dashboard_stats(db: Session):
    total_users = db.query(func.count(User.id)).scalar()
    total_items = db.query(func.count(Item.id)).scalar()
    total_categories = db.query(func.count(Category.id)).scalar()
    total_suppliers = db.query(func.count(Supplier.id)).scalar()
    total_stock_in = db.query(func.coalesce(func.sum(StockIn.quantity_added), 0)).scalar()
    total_stock_out = db.query(func.coalesce(func.sum(StockOut.quantity_removed), 0)).scalar()
    low_stock_items = db.query(Item).filter(Item.quantity <= Item.min_stock).all()

    recent_stock_in = db.query(StockIn).order_by(StockIn.date.desc()).limit(5).all()
    recent_stock_out = db.query(StockOut).order_by(StockOut.date.desc()).limit(5).all()
    recent_items = db.query(Item).order_by(Item.created_at.desc()).limit(5).all()

    return {
        "summary": {
            "total_users": total_users,
            "total_items": total_items,
            "total_categories": total_categories,
            "total_suppliers": total_suppliers,
            "total_stock_in": total_stock_in,
            "total_stock_out": total_stock_out,
            "low_stock_count": len(low_stock_items),
        },
        "recent_items": [item_to_dict(i) for i in recent_items],
        "recent_stock_in": [
            {
                "id": s.id,
                "item_id": s.item_id,
                "item_name": s.item.name if s.item else "",
                "quantity_added": s.quantity_added,
                "date": s.date,
                "note": s.note,
            }
            for s in recent_stock_in
        ],
        "recent_stock_out": [
            {
                "id": s.id,
                "item_id": s.item_id,
                "item_name": s.item.name if s.item else "",
                "quantity_removed": s.quantity_removed,
                "date": s.date,
                "purpose": s.purpose,
                "note": s.note,
            }
            for s in recent_stock_out
        ],
        "low_stock_items": [item_to_dict(i) for i in low_stock_items],
    }
