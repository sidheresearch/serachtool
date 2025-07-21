# app.py
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from models import (
    ProductSearchRequest, 
    UniqueProductSearchRequest, 
    EntitySearchRequest,
    ProductDateSearchRequest,
    DateFilterType
)
from services import (
    get_fuzzy_suggestions,
    search_by_product_names,
    search_by_unique_product_names,
    search_by_entities,
    get_top_importers_by_product,
    get_top_importers_by_unique_product,
    search_products_by_date_filter,
    get_product_date_analytics,
    filter_data_by_date_range  # Import the filtering service function
)

from typing import List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel

app = FastAPI(title="Trade Analytics API")

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model for filtering existing data
class FilterExistingDataRequest(BaseModel):
    data: List[Dict[str, Any]]  # The existing fetched data
    start_date: str  # Format: YYYY-MM-DD or DD/MM/YYYY
    end_date: str    # Format: YYYY-MM-DD or DD/MM/YYYY
    date_column: str = "reg_date"  # Column name to filter by

@app.get("/")
def root():
    return {"message": "Trade Analytics API", "status": "running"}

@app.get("/api/search/suggestions")
def get_suggestions(
    query: str = Query(...),
    search_type: str = Query(...),
    limit: int = Query(10)
):
    """Get fuzzy search suggestions"""
    try:
        suggestions = get_fuzzy_suggestions(query, search_type, limit)
        return {
            "suggestions": suggestions,
            "query": query,
            "search_type": search_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search/products")
def search_products(request: ProductSearchRequest):
    """Search by product names"""
    try:
        if not request.product_names:
            raise HTTPException(status_code=400, detail="Product names cannot be empty")
        
        result = search_by_product_names(request.product_names, request.filters)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search/unique-products")
def search_unique_products(request: UniqueProductSearchRequest):
    """Search by unique product names"""
    try:
        if not request.unique_product_names:
            raise HTTPException(status_code=400, detail="Unique product names cannot be empty")
        
        result = search_by_unique_product_names(request.unique_product_names, request.filters)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search/entities")
def search_entities(request: EntitySearchRequest):
    """Search by entity names"""
    try:
        if not request.entities:
            raise HTTPException(status_code=400, detail="Entities cannot be empty")
        
        result = search_by_entities(request.entities, request.filters)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Fixed top importers endpoints - using existing request models
@app.post("/api/search/top-importers/products")
async def get_top_importers_products(request: ProductSearchRequest):
    """Get top importers for product names"""
    try:
        if not request.product_names:
            raise HTTPException(status_code=400, detail="Product names cannot be empty")
            
        result = get_top_importers_by_product(
            request.product_names, 
            request.filters,
            limit=10
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search/top-importers/unique-products")
async def get_top_importers_unique_products(request: UniqueProductSearchRequest):
    """Get top importers for unique product names"""
    try:
        if not request.unique_product_names:
            raise HTTPException(status_code=400, detail="Unique product names cannot be empty")
            
        result = get_top_importers_by_unique_product(
            request.unique_product_names, 
            request.filters,
            limit=10
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search/products/by-date")
async def search_products_by_date(request: ProductDateSearchRequest):
    """Search products with date-based filtering"""
    try:
        if not request.product_names:
            raise HTTPException(status_code=400, detail="Product names cannot be empty")
        
        # Validate custom range dates
        if request.date_filter_type == DateFilterType.CUSTOM_RANGE:
            if not request.start_date or not request.end_date:
                raise HTTPException(
                    status_code=400, 
                    detail="start_date and end_date are required for custom_range filter"
                )
        
        result = search_products_by_date_filter(
            product_names=request.product_names,
            date_filter_type=request.date_filter_type.value,
            start_date=request.start_date,
            end_date=request.end_date,
            additional_filters=request.additional_filters
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analytics/products/by-date")
async def get_products_analytics_by_date(request: ProductDateSearchRequest):
    """Get product analytics with date-based filtering"""
    try:
        if not request.product_names:
            raise HTTPException(status_code=400, detail="Product names cannot be empty")
        
        result = get_product_date_analytics(
            product_names=request.product_names,
            date_filter_type=request.date_filter_type.value,
            start_date=request.start_date,
            end_date=request.end_date
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search/products/quick-date/{filter_type}")
async def quick_date_search(
    filter_type: DateFilterType,
    product_names: str = Query(..., description="Comma-separated product names")
):
    """Quick search with predefined date filters"""
    try:
        product_list = [name.strip() for name in product_names.split(',') if name.strip()]
        
        if not product_list:
            raise HTTPException(status_code=400, detail="Product names cannot be empty")
        
        result = search_products_by_date_filter(
            product_names=product_list,
            date_filter_type=filter_type.value
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search/filter-existing-data")
async def filter_existing_data_by_date(request: FilterExistingDataRequest):
    """Filter already fetched data by date range"""
    try:
        if not request.data:
            raise HTTPException(status_code=400, detail="Data cannot be empty")
        
        if not request.start_date or not request.end_date:
            raise HTTPException(status_code=400, detail="start_date and end_date are required")
        
        result = filter_data_by_date_range(
            data=request.data,
            start_date=request.start_date,
            end_date=request.end_date,
            date_column=request.date_column
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search/filter-by-date-range")
async def filter_search_results_by_date(request: FilterExistingDataRequest):
    """Alternative endpoint for filtering search results by date range"""
    try:
        if not request.data:
            raise HTTPException(status_code=400, detail="Data cannot be empty")
        
        result = filter_data_by_date_range(
            data=request.data,
            start_date=request.start_date,
            end_date=request.end_date,
            date_column=request.date_column
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))