// app/utils/api.ts
const API_BASE_URL = 'http://localhost:8000';

export interface SuggestionResponse {
  suggestions: string[];
  query: string;
  search_type: string;
}

export interface SearchFilters {
  hs_code?: string;
  importer_id?: string;
  port_name?: string;
  single_date?: string;
  start_date?: string;
  end_date?: string;
  date_mode?: 'single' | 'range';
}

export interface SearchResponse {
  data: any[];
  count: number;
  search_type: string;
  error?: string;
}

export interface TopImportersResponse {
  data: {
    true_importer_name: string;
    importer_id: string;
    city: string;
    total_shipments: number;
    total_value_usd: number;
    total_quantity: number;
    avg_unit_price_usd: number;
    first_import_date: string;
    last_import_date: string;
    unique_hs_codes: number;
    unique_countries: number;
  }[];
  count: number;
  search_type: string;
  products_searched: string[];
  error?: string;
}

// Add new interfaces for date-based filtering
export interface DateFilterType {
  LAST_7_DAYS: 'last_7_days';
  LAST_15_DAYS: 'last_15_days';
  LAST_30_DAYS: 'last_30_days';
  LAST_60_DAYS: 'last_60_days';
  LAST_90_DAYS: 'last_90_days';
  LAST_6_MONTHS: 'last_6_months';
  LAST_YEAR: 'last_year';
  CUSTOM_RANGE: 'custom_range';
}

export interface ProductDateSearchRequest {
  product_names: string[];
  date_filter_type: keyof DateFilterType;
  start_date?: string; // Format: YYYY-MM-DD
  end_date?: string;   // Format: YYYY-MM-DD
  additional_filters?: SearchFilters;
}

export interface DateRangeInfo {
  start_date: string;
  end_date: string;
  filter_type: string;
  days_covered: number;
}

export interface ProductDateSearchResponse extends SearchResponse {
  date_range: DateRangeInfo;
  products_searched: string[];
  summary: {
    total_value_usd: number;
    average_value_usd: number;
    unique_importers: number;
    unique_countries: number;
    total_shipments: number;
  };
  message: string;
}

export interface ProductAnalyticsResponse {
  analytics: {
    product_name: string;
    total_shipments: number;
    total_value: number;
    avg_value: number;
    unique_importers: number;
    unique_countries: number;
    first_import: string;
    last_import: string;
    total_quantity: number;
  }[];
  date_range: DateRangeInfo;
  products_searched: string[];
  total_products_found: number;
}

// NEW: Request and response interfaces for filtering existing data
export interface FilterExistingDataRequest {
  data: any[];
  start_date: string;
  end_date: string;
  date_column?: string;
}

export interface FilteredDataResponse {
  data: any[];
  count: number;
  original_count: number;
  filtered_count: number;
  date_range: {
    start_date: string;
    end_date: string;
    date_column: string;
    days_covered: number;
  };
  summary: {
    total_value_usd?: number;
    average_value_usd?: number;
    unique_importers?: number;
    unique_countries?: number;
    total_records: number;
  };
  message: string;
}

export const tradeAPI = {
  // Get fuzzy suggestions with debouncing support
  async getFuzzySuggestions(
    query: string, 
    searchType: 'product_name' | 'unique_product_name' | 'entity', 
    limit: number = 10
  ): Promise<SuggestionResponse> {
    if (!query || query.length < 2) {
      return { suggestions: [], query, search_type: searchType };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/search/suggestions?query=${encodeURIComponent(query)}&search_type=${searchType}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw new Error('Failed to fetch suggestions');
    }
  },

  // Search by product names
  async searchProducts(productNames: string[], filters?: SearchFilters): Promise<SearchResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          product_names: productNames, 
          filters: filters || {} 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search products');
    }
  },

  // Search by unique product names
  async searchUniqueProducts(uniqueProductNames: string[], filters?: SearchFilters): Promise<SearchResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/unique-products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          unique_product_names: uniqueProductNames, 
          filters: filters || {} 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching unique products:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search unique products');
    }
  },

  // Search by entities
  async searchEntities(entities: string[], filters?: SearchFilters): Promise<SearchResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/entities`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          entities, 
          filters: filters || {} 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching entities:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search entities');
    }
  },

  // Get top importers for products
  async getTopImportersForProducts(productNames: string[], filters?: SearchFilters): Promise<TopImportersResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/top-importers/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          product_names: productNames, 
          filters: filters || {} 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching top importers:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch top importers');
    }
  },

  // Get top importers for unique products
  async getTopImportersForUniqueProducts(uniqueProductNames: string[], filters?: SearchFilters): Promise<TopImportersResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/top-importers/unique-products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          unique_product_names: uniqueProductNames, 
          filters: filters || {} 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching top importers:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch top importers');
    }
  },

  // NEW: Search products with date filtering
  async searchProductsByDate(request: ProductDateSearchRequest): Promise<ProductDateSearchResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/products/by-date`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching products by date:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search products by date');
    }
  },

  // NEW: Get product analytics with date filtering
  async getProductAnalyticsByDate(request: ProductDateSearchRequest): Promise<ProductAnalyticsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics/products/by-date`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting product analytics by date:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get product analytics by date');
    }
  },

  // NEW: Quick date search (GET method for simple queries)
  async quickDateSearch(
    productNames: string[], 
    dateFilterType: keyof DateFilterType
  ): Promise<ProductDateSearchResponse> {
    try {
      const productNamesParam = productNames.join(',');
      const response = await fetch(
        `${API_BASE_URL}/api/search/products/quick-date/${dateFilterType}?product_names=${encodeURIComponent(productNamesParam)}`
      );
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in quick date search:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to perform quick date search');
    }
  },

  // NEW: Helper method to filter existing search results by date
  async filterExistingResultsByDate(
    productNames: string[], 
    dateFilterType: keyof DateFilterType,
    customStartDate?: string,
    customEndDate?: string,
    additionalFilters?: SearchFilters
  ): Promise<ProductDateSearchResponse> {
    try {
      const request: ProductDateSearchRequest = {
        product_names: productNames,
        date_filter_type: dateFilterType,
        additional_filters: additionalFilters
      };

      // Add custom dates if provided
      if (dateFilterType === 'CUSTOM_RANGE') {
        if (!customStartDate || !customEndDate) {
          throw new Error('Custom start and end dates are required for custom range filtering');
        }
        request.start_date = customStartDate;
        request.end_date = customEndDate;
      }

      return await this.searchProductsByDate(request);
    } catch (error) {
      console.error('Error filtering existing results by date:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to filter results by date');
    }
  },

  // NEW: Filter existing data by date range
  async filterExistingDataByDateRange(
    data: any[],
    startDate: string,
    endDate: string,
    dateColumn: string = 'reg_date'
  ): Promise<FilteredDataResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/filter-existing-data`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          data: data,
          start_date: startDate,
          end_date: endDate,
          date_column: dateColumn
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error filtering existing data by date range:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to filter data by date range');
    }
  },

  // Alternative method for filtering search results
  async filterSearchResultsByDateRange(
    searchResults: SearchResponse,
    startDate: string,
    endDate: string,
    dateColumn: string = 'reg_date'
  ): Promise<FilteredDataResponse> {
    try {
      return await this.filterExistingDataByDateRange(
        searchResults.data,
        startDate,
        endDate,
        dateColumn
      );
    } catch (error) {
      console.error('Error filtering search results by date range:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to filter search results by date range');
    }
  }
};

// Helper constants for date filter types
export const DATE_FILTER_OPTIONS = {
  LAST_7_DAYS: 'last_7_days' as const,
  LAST_15_DAYS: 'last_15_days' as const,
  LAST_30_DAYS: 'last_30_days' as const,
  LAST_60_DAYS: 'last_60_days' as const,
  LAST_90_DAYS: 'last_90_days' as const,
  LAST_6_MONTHS: 'last_6_months' as const,
  LAST_YEAR: 'last_year' as const,
  CUSTOM_RANGE: 'custom_range' as const,
};

// Helper function to get user-friendly labels
export const getDateFilterLabel = (filterType: string): string => {
  const labels: Record<string, string> = {
    'last_7_days': 'Last 7 Days',
    'last_15_days': 'Last 15 Days',
    'last_30_days': 'Last 30 Days',
    'last_60_days': 'Last 60 Days',
    'last_90_days': 'Last 90 Days',
    'last_6_months': 'Last 6 Months',
    'last_year': 'Last Year',
    'custom_range': 'Custom Range'
  };
  return labels[filterType] || filterType;
};