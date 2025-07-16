# services.py - Complete file with new functions
import pandas as pd
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, text
from fuzzywuzzy import fuzz, process
from models import SearchFilters
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")

def get_engine():
    if not DATABASE_URL:
        raise Exception("DATABASE_URL not found in environment variables")
    return create_engine(DATABASE_URL)

# Fuzzy Search Functions
def fuzzy_match(query: str, choices: List[str], limit: int = 50) -> List[str]:
    """Perform fuzzy matching and return top matches"""
    if not query or not choices:
        return []
    
    matches = process.extractBests(
        query, 
        choices, 
        scorer=fuzz.partial_ratio,
        score_cutoff=60,
        limit=limit
    )
    
    return [match[0] for match in matches]

# Cache for database lookups
_product_names_cache = None
_unique_product_names_cache = None
_entities_cache = None

def get_product_names():
    """Get all distinct product names"""
    global _product_names_cache
    if _product_names_cache is None:
        try:
            engine = get_engine()
            df = pd.read_sql(
                "SELECT DISTINCT product_name FROM analytics.product_icegate_imports WHERE product_name IS NOT NULL LIMIT 1000",
                engine
            )
            _product_names_cache = df["product_name"].tolist()
        except Exception as e:
            print(f"Error loading product names: {e}")
            _product_names_cache = ["Sample Product 1", "Sample Product 2"]
    return _product_names_cache

def get_unique_product_names():
    """Get all distinct unique product names"""
    global _unique_product_names_cache
    if _unique_product_names_cache is None:
        try:
            engine = get_engine()
            df = pd.read_sql(
                "SELECT DISTINCT unique_product_name FROM analytics.product_icegate_imports WHERE unique_product_name IS NOT NULL LIMIT 1000",
                engine
            )
            _unique_product_names_cache = df["unique_product_name"].tolist()
        except Exception as e:
            print(f"Error loading unique product names: {e}")
            _unique_product_names_cache = ["Sample Unique Product 1", "Sample Unique Product 2"]
    return _unique_product_names_cache

def get_entities():
    """Get all distinct entity names"""
    global _entities_cache
    if _entities_cache is None:
        try:
            engine = get_engine()
            # Get importers
            importer_df = pd.read_sql(
                "SELECT DISTINCT true_importer_name FROM analytics.product_icegate_imports WHERE true_importer_name IS NOT NULL LIMIT 500",
                engine
            )
            
            # Get suppliers
            supplier_df = pd.read_sql(
                "SELECT DISTINCT true_supplier_name FROM analytics.product_icegate_imports WHERE true_supplier_name IS NOT NULL LIMIT 500",
                engine
            )
            
            # Combine
            all_entities = set(
                importer_df["true_importer_name"].tolist() + 
                supplier_df["true_supplier_name"].tolist()
            )
            _entities_cache = list(all_entities)
        except Exception as e:
            print(f"Error loading entities: {e}")
            _entities_cache = ["Sample Entity 1", "Sample Entity 2"]
    return _entities_cache

def get_fuzzy_suggestions(query: str, search_type: str, limit: int = 10) -> List[str]:
    """Get fuzzy suggestions based on search type"""
    try:
        if search_type == "product_name":
            choices = get_product_names()
        elif search_type == "unique_product_name":
            choices = get_unique_product_names()
        elif search_type == "entity":
            choices = get_entities()
        else:
            return []
        
        return fuzzy_match(query, choices, limit)
    except Exception as e:
        print(f"Error in get_fuzzy_suggestions: {e}")
        return []

def build_query_with_filters_dict(base_query: str, params: Dict, filters: Optional[SearchFilters]) -> tuple:
    """Build query with filters using dictionary parameters"""
    query = base_query
    
    if not filters:
        return query, params
    
    param_counter = len(params)
    
    # Additional filters
    if filters.hs_code:
        query += f" AND hs_code = :filter_param_{param_counter}"
        params[f"filter_param_{param_counter}"] = int(filters.hs_code)
        param_counter += 1
    
    if filters.importer_id:
        query += f" AND importer_id LIKE :filter_param_{param_counter}"
        params[f"filter_param_{param_counter}"] = f"%{filters.importer_id}%"
        param_counter += 1
    
    if filters.port_name:
        query += f" AND (indian_port LIKE :filter_param_{param_counter} OR foreign_port LIKE :filter_param_{param_counter + 1})"
        params[f"filter_param_{param_counter}"] = f"%{filters.port_name}%"
        params[f"filter_param_{param_counter + 1}"] = f"%{filters.port_name}%"
        param_counter += 2
    
    # Date filters
    if filters.date_mode == "single" and filters.single_date:
        query += f" AND reg_date = :filter_param_{param_counter}"
        params[f"filter_param_{param_counter}"] = filters.single_date
        param_counter += 1
    elif filters.date_mode == "range":
        if filters.start_date:
            query += f" AND reg_date >= :filter_param_{param_counter}"
            params[f"filter_param_{param_counter}"] = filters.start_date
            param_counter += 1
        if filters.end_date:
            query += f" AND reg_date <= :filter_param_{param_counter}"
            params[f"filter_param_{param_counter}"] = filters.end_date
            param_counter += 1
    
    query += " ORDER BY reg_date DESC LIMIT 1000"
    return query, params

def search_by_product_names(product_names: List[str], filters: Optional[SearchFilters] = None) -> Dict[str, Any]:
    """Search by product names - returns all columns"""
    try:
        engine = get_engine()
        
        # Select all columns
        placeholders = ",".join([f":param_{i}" for i in range(len(product_names))])
        base_query = f"""
            SELECT system_id, reg_date, month_year, hs_code, chapter, unique_product_name, 
                   quantity, unit_quantity, unit_price_usd, total_value_usd, importer_id, 
                   true_importer_name, city, cha_number, type, true_supplier_name, 
                   indian_port, foreign_port, origin_country, exchange_rate_usd, duty, 
                   product_name, supplier_name, supplier_address, target_date, id, importer
            FROM analytics.product_icegate_imports 
            WHERE product_name IN ({placeholders})
        """
        
        # Create parameters dictionary
        params = {f"param_{i}": name for i, name in enumerate(product_names)}
        
        # Add filters to query and params
        query, params = build_query_with_filters_dict(base_query, params, filters)
        
        # Execute query using text() for proper parameter binding
        df = pd.read_sql(text(query), engine, params=params)
        
        return {
            "data": df.to_dict('records'),
            "count": len(df),
            "search_type": "product_name",
            "total_records": len(df)
        }
    except Exception as e:
        print(f"Error in search_by_product_names: {e}")
        return {
            "data": [{"product_name": name, "error": "Database error", "sample": True} for name in product_names],
            "count": len(product_names),
            "search_type": "product_name",
            "error": str(e)
        }

def search_by_unique_product_names(unique_product_names: List[str], filters: Optional[SearchFilters] = None) -> Dict[str, Any]:
    """Search by unique product names - returns all columns"""
    try:
        engine = get_engine()
        
        # Select all columns
        placeholders = ",".join([f":param_{i}" for i in range(len(unique_product_names))])
        base_query = f"""
            SELECT system_id, reg_date, month_year, hs_code, chapter, unique_product_name, 
                   quantity, unit_quantity, unit_price_usd, total_value_usd, importer_id, 
                   true_importer_name, city, cha_number, type, true_supplier_name, 
                   indian_port, foreign_port, origin_country, exchange_rate_usd, duty, 
                   product_name, supplier_name, supplier_address, target_date, id, importer
            FROM analytics.product_icegate_imports 
            WHERE unique_product_name IN ({placeholders})
        """
        
        # Create parameters dictionary
        params = {f"param_{i}": name for i, name in enumerate(unique_product_names)}
        
        # Add filters to query and params
        query, params = build_query_with_filters_dict(base_query, params, filters)
        
        # Execute query using text() for proper parameter binding
        df = pd.read_sql(text(query), engine, params=params)
        
        return {
            "data": df.to_dict('records'),
            "count": len(df),
            "search_type": "unique_product_name",
            "total_records": len(df)
        }
    except Exception as e:
        print(f"Error in search_by_unique_product_names: {e}")
        return {
            "data": [{"unique_product_name": name, "error": "Database error", "sample": True} for name in unique_product_names],
            "count": len(unique_product_names),
            "search_type": "unique_product_name",
            "error": str(e)
        }

def search_by_entities(entities: List[str], filters: Optional[SearchFilters] = None) -> Dict[str, Any]:
    """Search by entity names - returns all columns"""
    try:
        engine = get_engine()
        
        # Fixed: Use different parameter names for importer and supplier conditions
        importer_placeholders = ",".join([f":imp_param_{i}" for i in range(len(entities))])
        supplier_placeholders = ",".join([f":sup_param_{i}" for i in range(len(entities))])
        
        base_query = f"""
            SELECT system_id, reg_date, month_year, hs_code, chapter, unique_product_name, 
                   quantity, unit_quantity, unit_price_usd, total_value_usd, importer_id, 
                   true_importer_name, city, cha_number, type, true_supplier_name, 
                   indian_port, foreign_port, origin_country, exchange_rate_usd, duty, 
                   product_name, supplier_name, supplier_address, target_date, id, importer
            FROM analytics.product_icegate_imports 
            WHERE true_importer_name IN ({importer_placeholders}) 
            OR true_supplier_name IN ({supplier_placeholders})
        """
        
        # Create parameters dictionary with different names for importers and suppliers
        params = {}
        for i, entity in enumerate(entities):
            params[f"imp_param_{i}"] = entity
            params[f"sup_param_{i}"] = entity
        
        # Add filters to query and params
        query, params = build_query_with_filters_dict(base_query, params, filters)
        
        # Execute query using text() for proper parameter binding
        df = pd.read_sql(text(query), engine, params=params)
        
        return {
            "data": df.to_dict('records'),
            "count": len(df),
            "search_type": "entity",
            "total_records": len(df)
        }
    except Exception as e:
        print(f"Error in search_by_entities: {e}")
        return {
            "data": [{"entity_name": name, "error": "Database error", "sample": True} for name in entities],
            "count": len(entities),
            "search_type": "entity",
            "error": str(e)
        }

def get_top_importers_by_product(product_names: List[str], filters: Optional[SearchFilters] = None, limit: int = 10) -> Dict[str, Any]:
    """Get top importers for specific products by total value"""
    try:
        engine = get_engine()
        
        # Build the base query with aggregation
        placeholders = ",".join([f":param_{i}" for i in range(len(product_names))])
        base_query = f"""
            SELECT 
                true_importer_name,
                importer_id,
                city,
                COUNT(*) as total_shipments,
                SUM(total_value_usd) as total_value_usd,
                SUM(quantity) as total_quantity,
                AVG(unit_price_usd) as avg_unit_price_usd,
                MIN(reg_date) as first_import_date,
                MAX(reg_date) as last_import_date,
                COUNT(DISTINCT hs_code) as unique_hs_codes,
                COUNT(DISTINCT origin_country) as unique_countries
            FROM analytics.product_icegate_imports 
            WHERE product_name IN ({placeholders})
            AND true_importer_name IS NOT NULL
            AND total_value_usd IS NOT NULL
        """
        
        # Create parameters dictionary
        params = {f"param_{i}": name for i, name in enumerate(product_names)}
        
        # Add filters (simplified for aggregation query)
        if filters:
            param_counter = len(params)
            
            if filters.hs_code:
                base_query += f" AND hs_code = :filter_param_{param_counter}"
                params[f"filter_param_{param_counter}"] = int(filters.hs_code)
                param_counter += 1
            
            if filters.date_mode == "single" and filters.single_date:
                base_query += f" AND reg_date = :filter_param_{param_counter}"
                params[f"filter_param_{param_counter}"] = filters.single_date
                param_counter += 1
            elif filters.date_mode == "range":
                if filters.start_date:
                    base_query += f" AND reg_date >= :filter_param_{param_counter}"
                    params[f"filter_param_{param_counter}"] = filters.start_date
                    param_counter += 1
                if filters.end_date:
                    base_query += f" AND reg_date <= :filter_param_{param_counter}"
                    params[f"filter_param_{param_counter}"] = filters.end_date
                    param_counter += 1
        
        # Group by and order by total value
        base_query += f"""
            GROUP BY true_importer_name, importer_id, city
            ORDER BY total_value_usd DESC
            LIMIT {limit}
        """
        
        # Execute query
        df = pd.read_sql(text(base_query), engine, params=params)
        
        return {
            "data": df.to_dict('records'),
            "count": len(df),
            "search_type": "top_importers",
            "products_searched": product_names
        }
    except Exception as e:
        print(f"Error in get_top_importers_by_product: {e}")
        return {
            "data": [],
            "count": 0,
            "search_type": "top_importers",
            "error": str(e),
            "products_searched": product_names
        }

def get_top_importers_by_unique_product(unique_product_names: List[str], filters: Optional[SearchFilters] = None, limit: int = 10) -> Dict[str, Any]:
    """Get top importers for specific unique products by total value"""
    try:
        engine = get_engine()
        
        placeholders = ",".join([f":param_{i}" for i in range(len(unique_product_names))])
        base_query = f"""
            SELECT 
                true_importer_name,
                importer_id,
                city,
                COUNT(*) as total_shipments,
                SUM(total_value_usd) as total_value_usd,
                SUM(quantity) as total_quantity,
                AVG(unit_price_usd) as avg_unit_price_usd,
                MIN(reg_date) as first_import_date,
                MAX(reg_date) as last_import_date,
                COUNT(DISTINCT hs_code) as unique_hs_codes,
                COUNT(DISTINCT origin_country) as unique_countries
            FROM analytics.product_icegate_imports 
            WHERE unique_product_name IN ({placeholders})
            AND true_importer_name IS NOT NULL
            AND total_value_usd IS NOT NULL
        """
        
        params = {f"param_{i}": name for i, name in enumerate(unique_product_names)}
        
        # Add filters (similar to above)
        if filters:
            param_counter = len(params)
            
            if filters.hs_code:
                base_query += f" AND hs_code = :filter_param_{param_counter}"
                params[f"filter_param_{param_counter}"] = int(filters.hs_code)
                param_counter += 1
                
            if filters.date_mode == "single" and filters.single_date:
                base_query += f" AND reg_date = :filter_param_{param_counter}"
                params[f"filter_param_{param_counter}"] = filters.single_date
                param_counter += 1
            elif filters.date_mode == "range":
                if filters.start_date:
                    base_query += f" AND reg_date >= :filter_param_{param_counter}"
                    params[f"filter_param_{param_counter}"] = filters.start_date
                    param_counter += 1
                if filters.end_date:
                    base_query += f" AND reg_date <= :filter_param_{param_counter}"
                    params[f"filter_param_{param_counter}"] = filters.end_date
                    param_counter += 1
        
        base_query += f"""
            GROUP BY true_importer_name, importer_id, city
            ORDER BY total_value_usd DESC
            LIMIT {limit}
        """
        
        df = pd.read_sql(text(base_query), engine, params=params)
        
        return {
            "data": df.to_dict('records'),
            "count": len(df),
            "search_type": "top_importers",
            "products_searched": unique_product_names
        }
    except Exception as e:
        print(f"Error in get_top_importers_by_unique_product: {e}")
        return {
            "data": [],
            "count": 0,
            "search_type": "top_importers",
            "error": str(e),
            "products_searched": unique_product_names
        }