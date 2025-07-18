# services.py - Complete updated file
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, text
from fuzzywuzzy import fuzz, process
from models import SearchFilters
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")

def get_engine():
    if not DATABASE_URL:
        raise Exception("DATABASE_URL not found in environment variables")
    return create_engine(DATABASE_URL)

# Helper function to clean data for JSON serialization
def clean_dataframe_for_json(df: pd.DataFrame) -> pd.DataFrame:
    """Clean DataFrame by replacing NaN, inf, and -inf values with appropriate defaults"""
    df_cleaned = df.copy()
    
    # Numeric columns - replace NaN with 0, inf/-inf with large/small numbers
    numeric_columns = df_cleaned.select_dtypes(include=[np.number]).columns
    
    for col in numeric_columns:
        df_cleaned[col] = df_cleaned[col].fillna(0)
        df_cleaned[col] = df_cleaned[col].replace([np.inf, -np.inf], [999999999, -999999999])
        df_cleaned[col] = pd.to_numeric(df_cleaned[col], errors='coerce').fillna(0)
    
    # String/object columns - replace NaN with empty string or 'N/A'
    object_columns = df_cleaned.select_dtypes(include=['object']).columns
    
    for col in object_columns:
        df_cleaned[col] = df_cleaned[col].fillna('N/A')
        df_cleaned[col] = df_cleaned[col].replace(['nan', 'NaN', 'null', 'NULL'], 'N/A')
    
    # Date columns
    datetime_columns = df_cleaned.select_dtypes(include=['datetime64']).columns
    for col in datetime_columns:
        df_cleaned[col] = df_cleaned[col].dt.strftime('%Y-%m-%d %H:%M:%S').fillna('N/A')
    
    return df_cleaned

def safe_numeric_calc(series, operation='sum'):
    """Safely calculate numeric operations handling NaN values"""
    if operation == 'sum':
        result = series.sum()
    elif operation == 'mean':
        result = series.mean()
    elif operation == 'nunique':
        result = series.nunique()
    else:
        result = 0
    
    return float(result) if pd.notna(result) else 0.0

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
        df_cleaned = clean_dataframe_for_json(df)
        
        return {
            "data": df_cleaned.to_dict('records'),
            "count": len(df_cleaned),
            "search_type": "product_name",
            "total_records": len(df_cleaned)
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
        df_cleaned = clean_dataframe_for_json(df)
        
        return {
            "data": df_cleaned.to_dict('records'),
            "count": len(df_cleaned),
            "search_type": "unique_product_name",
            "total_records": len(df_cleaned)
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
        df_cleaned = clean_dataframe_for_json(df)
        
        return {
            "data": df_cleaned.to_dict('records'),
            "count": len(df_cleaned),
            "search_type": "entity",
            "total_records": len(df_cleaned)
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
        df_cleaned = clean_dataframe_for_json(df)
        
        return {
            "data": df_cleaned.to_dict('records'),
            "count": len(df_cleaned),
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
        df_cleaned = clean_dataframe_for_json(df)
        
        return {
            "data": df_cleaned.to_dict('records'),
            "count": len(df_cleaned),
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

def search_products_by_date_filter(
    product_names: List[str], 
    date_filter_type: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    additional_filters: Optional[SearchFilters] = None
) -> Dict[str, Any]:
    """Search products with date-based filtering"""
    try:
        engine = get_engine()
        
        # Base query for products - Updated to use correct table
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
        
        # Calculate date range based on filter type
        end_date_calc = datetime.now().date()
        
        if date_filter_type == "last_7_days":
            start_date_calc = end_date_calc - timedelta(days=7)
        elif date_filter_type == "last_15_days":
            start_date_calc = end_date_calc - timedelta(days=15)
        elif date_filter_type == "last_30_days":
            start_date_calc = end_date_calc - timedelta(days=30)
        elif date_filter_type == "last_60_days":
            start_date_calc = end_date_calc - timedelta(days=60)
        elif date_filter_type == "last_90_days":
            start_date_calc = end_date_calc - timedelta(days=90)
        elif date_filter_type == "last_6_months":
            start_date_calc = end_date_calc - timedelta(days=180)
        elif date_filter_type == "last_year":
            start_date_calc = end_date_calc - timedelta(days=365)
        elif date_filter_type == "custom_range":
            if not start_date or not end_date:
                raise ValueError("start_date and end_date are required for custom_range")
            start_date_calc = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date_calc = datetime.strptime(end_date, '%Y-%m-%d').date()
        else:
            raise ValueError(f"Invalid date_filter_type: {date_filter_type}")
        
        # Add date filter to query
        param_counter = len(params)
        base_query += f" AND reg_date >= :date_start_{param_counter}"
        base_query += f" AND reg_date <= :date_end_{param_counter}"
        params[f"date_start_{param_counter}"] = start_date_calc
        params[f"date_end_{param_counter}"] = end_date_calc
        
        # Add additional filters if provided
        if additional_filters:
            filters_dict = additional_filters.dict() if hasattr(additional_filters, 'dict') else additional_filters
            
            if filters_dict.get('hs_code'):
                param_counter += 1
                base_query += f" AND hs_code = :filter_hs_{param_counter}"
                params[f"filter_hs_{param_counter}"] = int(filters_dict['hs_code'])
            
            if filters_dict.get('importer_id'):
                param_counter += 1
                base_query += f" AND importer_id = :filter_imp_{param_counter}"
                params[f"filter_imp_{param_counter}"] = filters_dict['importer_id']
            
            if filters_dict.get('port_name'):
                param_counter += 1
                base_query += f" AND indian_port LIKE :filter_port_{param_counter}"
                params[f"filter_port_{param_counter}"] = f"%{filters_dict['port_name']}%"
        
        base_query += " ORDER BY reg_date DESC"
        
        # Execute query
        df = pd.read_sql(text(base_query), engine, params=params)
        
        if df.empty:
            return {
                "data": [],
                "count": 0,
                "date_range": {
                    "start_date": str(start_date_calc),
                    "end_date": str(end_date_calc),
                    "filter_type": date_filter_type,
                    "days_covered": (end_date_calc - start_date_calc).days
                },
                "products_searched": product_names,
                "summary": {
                    "total_value_usd": 0.0,
                    "average_value_usd": 0.0,
                    "unique_importers": 0,
                    "unique_countries": 0,
                    "total_shipments": 0
                },
                "message": f"No records found for the specified products in the date range {start_date_calc} to {end_date_calc}"
            }
        
        # Clean the data before processing
        df_cleaned = clean_dataframe_for_json(df)
        records = df_cleaned.to_dict('records')
        
        # Calculate summary statistics with safe handling
        summary = {
            "total_value_usd": safe_numeric_calc(df['total_value_usd'], 'sum'),
            "average_value_usd": safe_numeric_calc(df['total_value_usd'], 'mean'),
            "unique_importers": int(safe_numeric_calc(df['true_importer_name'], 'nunique')),
            "unique_countries": int(safe_numeric_calc(df['origin_country'], 'nunique')),
            "total_shipments": len(records)
        }
        
        return {
            "data": records,
            "count": len(records),
            "date_range": {
                "start_date": str(start_date_calc),
                "end_date": str(end_date_calc),
                "filter_type": date_filter_type,
                "days_covered": (end_date_calc - start_date_calc).days
            },
            "products_searched": product_names,
            "summary": summary,
            "message": f"Found {len(records)} records for {len(product_names)} products from {start_date_calc} to {end_date_calc}"
        }
        
    except Exception as e:
        print(f"Error in search_products_by_date_filter: {str(e)}")
        raise e

def parse_date_flexible(date_string: str) -> datetime:
    """Parse date from multiple formats"""
    date_formats = [
        '%Y-%m-%d',      # 2025-06-05
        '%d/%m/%Y',      # 05/06/2025
        '%m/%d/%Y',      # 06/05/2025
        '%Y/%m/%d',      # 2025/06/05
        '%d-%m-%Y',      # 05-06-2025
        '%m-%d-%Y',      # 06-05-2025
    ]
    
    for fmt in date_formats:
        try:
            return datetime.strptime(date_string, fmt)
        except ValueError:
            continue
    
    raise ValueError(f"Unable to parse date: {date_string}")

def filter_data_by_date_range(
    data: List[Dict[str, Any]], 
    start_date: str, 
    end_date: str,
    date_column: str = "reg_date"
) -> Dict[str, Any]:
    """Filter existing data by date range"""
    try:
        if not data:
            return {
                "data": [],
                "count": 0,
                "original_count": 0,
                "date_range": {
                    "start_date": start_date,
                    "end_date": end_date,
                    "date_column": date_column
                },
                "message": "No data provided for filtering"
            }
        
        # Parse the date range
        try:
            start_date_obj = parse_date_flexible(start_date).date()
            end_date_obj = parse_date_flexible(end_date).date()
        except ValueError as e:
            raise ValueError(f"Invalid date format: {str(e)}")
        
        # Convert to DataFrame for easier filtering
        df = pd.DataFrame(data)
        original_count = len(df)
        
        # Check if date column exists
        if date_column not in df.columns:
            available_columns = list(df.columns)
            date_columns = [col for col in available_columns if 'date' in col.lower()]
            if date_columns:
                date_column = date_columns[0]
                print(f"Using '{date_column}' as date column instead.")
            else:
                raise ValueError(f"Date column '{date_column}' not found. Available columns: {available_columns}")
        
        # Convert date column to datetime
        df[date_column] = pd.to_datetime(df[date_column], errors='coerce')
        
        # Remove rows where date conversion failed
        df = df.dropna(subset=[date_column])
        
        # Filter by date range
        mask = (df[date_column].dt.date >= start_date_obj) & (df[date_column].dt.date <= end_date_obj)
        filtered_df = df[mask]
        
        # Clean the filtered data
        filtered_df_cleaned = clean_dataframe_for_json(filtered_df)
        filtered_data = filtered_df_cleaned.to_dict('records')
        
        # Calculate summary statistics with safe handling
        summary = {
            "total_records": len(filtered_data)
        }
        
        if 'total_value_usd' in filtered_df.columns:
            summary['total_value_usd'] = safe_numeric_calc(filtered_df['total_value_usd'], 'sum')
            summary['average_value_usd'] = safe_numeric_calc(filtered_df['total_value_usd'], 'mean')
        
        if 'true_importer_name' in filtered_df.columns:
            summary['unique_importers'] = int(safe_numeric_calc(filtered_df['true_importer_name'], 'nunique'))
        
        if 'origin_country' in filtered_df.columns:
            summary['unique_countries'] = int(safe_numeric_calc(filtered_df['origin_country'], 'nunique'))
        
        return {
            "data": filtered_data,
            "count": len(filtered_data),
            "original_count": original_count,
            "filtered_count": len(filtered_data),
            "date_range": {
                "start_date": str(start_date_obj),
                "end_date": str(end_date_obj),
                "date_column": date_column,
                "days_covered": (end_date_obj - start_date_obj).days + 1
            },
            "summary": summary,
            "message": f"Filtered {len(filtered_data)} records from {original_count} total records for date range {start_date_obj} to {end_date_obj}"
        }
        
    except Exception as e:
        print(f"Error in filter_data_by_date_range: {str(e)}")
        raise e

def get_product_date_analytics(
    product_names: List[str],
    date_filter_type: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> Dict[str, Any]:
    """Get analytics for products by date range"""
    try:
        engine = get_engine()
        
        # Calculate date range
        end_date_calc = datetime.now().date()
        
        if date_filter_type == "last_7_days":
            start_date_calc = end_date_calc - timedelta(days=7)
        elif date_filter_type == "last_15_days":
            start_date_calc = end_date_calc - timedelta(days=15)
        elif date_filter_type == "last_30_days":
            start_date_calc = end_date_calc - timedelta(days=30)
        elif date_filter_type == "last_60_days":
            start_date_calc = end_date_calc - timedelta(days=60)
        elif date_filter_type == "last_90_days":
            start_date_calc = end_date_calc - timedelta(days=90)
        elif date_filter_type == "last_6_months":
            start_date_calc = end_date_calc - timedelta(days=180)
        elif date_filter_type == "last_year":
            start_date_calc = end_date_calc - timedelta(days=365)
        elif date_filter_type == "custom_range":
            start_date_calc = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date_calc = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Analytics query
        placeholders = ",".join([f":param_{i}" for i in range(len(product_names))])
        analytics_query = f"""
        SELECT 
            product_name,
            COUNT(*) as total_shipments,
            SUM(total_value_usd) as total_value,
            AVG(total_value_usd) as avg_value,
            COUNT(DISTINCT true_importer_name) as unique_importers,
            COUNT(DISTINCT origin_country) as unique_countries,
            MIN(reg_date) as first_import,
            MAX(reg_date) as last_import,
            SUM(quantity) as total_quantity
        FROM analytics.product_icegate_imports 
        WHERE product_name IN ({placeholders})
        AND reg_date >= :start_date
        AND reg_date <= :end_date
        GROUP BY product_name
        ORDER BY total_value DESC
        """
        
        params = {f"param_{i}": name for i, name in enumerate(product_names)}
        params['start_date'] = start_date_calc
        params['end_date'] = end_date_calc
        
        df = pd.read_sql(text(analytics_query), engine, params=params)
        
        if df.empty:
            return {
                "analytics": [],
                "date_range": {
                    "start_date": str(start_date_calc),
                    "end_date": str(end_date_calc),
                    "filter_type": date_filter_type
                },
                "products_searched": product_names,
                "message": "No data found for analytics"
            }
        
        df_cleaned = clean_dataframe_for_json(df)
        analytics_data = df_cleaned.to_dict('records')
        
        return {
            "analytics": analytics_data,
            "date_range": {
                "start_date": str(start_date_calc),
                "end_date": str(end_date_calc),
                "filter_type": date_filter_type,
                "days_covered": (end_date_calc - start_date_calc).days
            },
            "products_searched": product_names,
            "total_products_found": len(analytics_data)
        }
        
    except Exception as e:
        print(f"Error in get_product_date_analytics: {str(e)}")
        raise e