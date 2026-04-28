from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


class UserBase(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    role: str = "Staff"
    status: str = "Active"


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    status: Optional[str] = None
    password: Optional[str] = None


class UserOut(UserBase):
    id: int
    profile_image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    full_name: str
    email: EmailStr


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(min_length=6)
    confirm_password: str


class SettingsBase(BaseModel):
    school_name: str
    school_address: str = ""
    school_phone: str = ""
    school_email: str = ""


class SettingsOut(SettingsBase):
    id: int
    school_logo: Optional[str] = None

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    name: str
    description: str = ""


class CategoryOut(CategoryBase):
    id: int

    class Config:
        from_attributes = True


class SupplierBase(BaseModel):
    name: str
    contact_person: str = ""
    phone: str = ""
    email: str = ""
    address: str = ""


class SupplierOut(SupplierBase):
    id: int

    class Config:
        from_attributes = True


class ItemBase(BaseModel):
    name: str
    category_id: int
    supplier_id: int
    quantity: int = Field(ge=0)
    unit: str
    min_stock: int = Field(ge=0)
    description: str = ""


class ItemOut(ItemBase):
    id: int
    image: Optional[str] = None
    created_at: datetime
    category_name: str
    supplier_name: str

    class Config:
        from_attributes = True


class StockInBase(BaseModel):
    item_id: int
    quantity_added: int = Field(gt=0)
    date: datetime
    note: str = ""


class StockOutBase(BaseModel):
    item_id: int
    quantity_removed: int = Field(gt=0)
    date: datetime
    purpose: str = ""
    note: str = ""


class StockInOut(BaseModel):
    id: int
    item_id: int
    item_name: str
    quantity_added: int
    date: datetime
    note: str

    class Config:
        from_attributes = True


class StockOutOut(BaseModel):
    id: int
    item_id: int
    item_name: str
    quantity_removed: int
    date: datetime
    purpose: str
    note: str

    class Config:
        from_attributes = True
