# models.py
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date
from enum import Enum

class SearchFilters(BaseModel):
    hs_code: Optional[str] = None
    importer_id: Optional[str] = None
    port_name: Optional[str] = None
    date_mode: Optional[str] = None
    single_date: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ProductSearchRequest(BaseModel):
    product_names: List[str]
    filters: Optional[SearchFilters] = None

class UniqueProductSearchRequest(BaseModel):
    unique_product_names: List[str]
    filters: Optional[SearchFilters] = None

class EntitySearchRequest(BaseModel):
    entities: List[str]
    filters: Optional[SearchFilters] = None

# New model for date-based product search
class DateFilterType(str, Enum):
    LAST_7_DAYS = "last_7_days"
    LAST_15_DAYS = "last_15_days"
    LAST_30_DAYS = "last_30_days"
    LAST_60_DAYS = "last_60_days"
    LAST_90_DAYS = "last_90_days"
    LAST_6_MONTHS = "last_6_months"
    LAST_YEAR = "last_year"
    CUSTOM_RANGE = "custom_range"

class ProductDateSearchRequest(BaseModel):
    product_names: List[str]
    date_filter_type: str  # Changed from DateFilterType enum to string
    start_date: Optional[str] = None  # Format: YYYY-MM-DD
    end_date: Optional[str] = None    # Format: YYYY-MM-DD
    additional_filters: Optional[SearchFilters] = None