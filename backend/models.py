from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="Staff")
    status = Column(String(20), default="Active")
    profile_image = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    school_name = Column(String(150), default="My School")
    school_logo = Column(String(255), nullable=True)
    school_address = Column(String(255), default="")
    school_phone = Column(String(50), default="")
    school_email = Column(String(120), default="")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, nullable=False)
    description = Column(Text, default="")

    items = relationship("Item", back_populates="category", cascade="all, delete")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, nullable=False)
    contact_person = Column(String(120), default="")
    phone = Column(String(50), default="")
    email = Column(String(120), default="")
    address = Column(Text, default="")

    items = relationship("Item", back_populates="supplier", cascade="all, delete")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    quantity = Column(Integer, default=0)
    unit = Column(String(30), default="pcs")
    min_stock = Column(Integer, default=0)
    description = Column(Text, default="")
    image = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="items")
    supplier = relationship("Supplier", back_populates="items")


class StockIn(Base):
    __tablename__ = "stock_in"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity_added = Column(Integer, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    note = Column(Text, default="")

    item = relationship("Item")


class StockOut(Base):
    __tablename__ = "stock_out"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    quantity_removed = Column(Integer, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    purpose = Column(String(255), default="")
    note = Column(Text, default="")

    item = relationship("Item")
