'use client';
import { useState, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Card, 
  CardContent, 
  Fade, 
  Alert,
  Snackbar
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

// Import all components
import { Header } from './components/Header';
import { SearchForm } from './components/SearchForm';
import { AdvancedFilters } from './components/AdvancedFilters';
import { QuickDateFilters } from './components/QuickDateFilters';
import { ResultsTable } from './components/ResultsTable';
import { TopImportersSection } from './components/TopImportersSection';

// Import API and types
import { tradeAPI, SearchResponse, TopImportersResponse, SearchFilters } from './utils/api';

export default function Home() {
  // Search state
  const [productNames, setProductNames] = useState<string[]>([]);
  const [uniqueProductNames, setUniqueProductNames] = useState<string[]>([]);
  const [entities, setEntities] = useState<string[]>([]);
  
  // Filter state
  const [hsCode, setHsCode] = useState('');
  const [importerId, setImporterId] = useState('');
  const [portName, setPortName] = useState('');
  const [dateMode, setDateMode] = useState<'single' | 'range'>('range');
  const [singleDate, setSingleDate] = useState<Dayjs | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTopImporters, setLoadingTopImporters] = useState(false);
  
  // Results state
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [originalResults, setOriginalResults] = useState<SearchResponse | null>(null);
  const [topImporters, setTopImporters] = useState<TopImportersResponse | null>(null);
  const [showTopImporters, setShowTopImporters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Computed values
  const hasData = searchResults && searchResults.data.length > 0;
  const totalPages = hasData ? Math.ceil(searchResults.data.length / itemsPerPage) : 0;
  const paginatedData = hasData 
    ? searchResults.data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : [];

  // Helper functions
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const buildFilters = (): SearchFilters => {
    const filters: SearchFilters = {};
    
    if (hsCode.trim()) filters.hs_code = hsCode.trim();
    if (importerId.trim()) filters.importer_id = importerId.trim();
    if (portName.trim()) filters.port_name = portName.trim();
    
    filters.date_mode = dateMode;
    if (dateMode === 'single' && singleDate) {
      filters.single_date = singleDate.format('YYYY-MM-DD');
    } else if (dateMode === 'range' && startDate && endDate) {
      filters.start_date = startDate.format('YYYY-MM-DD');
      filters.end_date = endDate.format('YYYY-MM-DD');
    }
    
    return filters;
  };

  // Main search function
  const handlePrimarySearch = useCallback(async () => {
    if (productNames.length === 0 && uniqueProductNames.length === 0 && entities.length === 0) {
      showNotification('Please select at least one search term', 'warning');
      return;
    }

    setIsLoading(true);
    setCurrentPage(1);
    setShowTopImporters(false);
    
    try {
      const filters = buildFilters();
      let response: SearchResponse;

      if (productNames.length > 0) {
        response = await tradeAPI.searchProducts(productNames, filters);
      } else if (uniqueProductNames.length > 0) {
        response = await tradeAPI.searchUniqueProducts(uniqueProductNames, filters);
      } else {
        response = await tradeAPI.searchEntities(entities, filters);
      }

      setSearchResults(response);
      setOriginalResults(response);
      
      if (response.data.length > 0) {
        showNotification(`Found ${response.count} results`, 'success');
      } else {
        showNotification('No results found. Try adjusting your search criteria.', 'info');
      }
    } catch (error) {
      console.error('Search error:', error);
      showNotification('Search failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [productNames, uniqueProductNames, entities, hsCode, importerId, portName, dateMode, singleDate, startDate, endDate]);

  // Clear search function
  const clearSearch = useCallback(() => {
    setProductNames([]);
    setUniqueProductNames([]);
    setEntities([]);
    setHsCode('');
    setImporterId('');
    setPortName('');
    setSingleDate(null);
    setStartDate(null);
    setEndDate(null);
    setSearchResults(null);
    setOriginalResults(null);
    setTopImporters(null);
    setShowTopImporters(false);
    setCurrentPage(1);
    showNotification('Search cleared', 'info');
  }, []);

  // Quick date filter function
  const handleQuickDateFilterExistingData = useCallback((days: number) => {
    if (!originalResults || originalResults.data.length === 0) {
      showNotification('No data to filter', 'warning');
      return;
    }

    const cutoffDate = dayjs().subtract(days, 'day');
    const filteredData = originalResults.data.filter(item => {
      if (!item.reg_date) return false;
      return dayjs(item.reg_date).isAfter(cutoffDate);
    });

    setSearchResults({
      ...originalResults,
      data: filteredData,
      count: filteredData.length
    });
    
    setCurrentPage(1);
    showNotification(`Filtered to last ${days} days: ${filteredData.length} results`, 'info');
  }, [originalResults]);

  // Clear date filter function
  const handleClearDateFilter = useCallback(() => {
    if (originalResults) {
      setSearchResults(originalResults);
      setCurrentPage(1);
      showNotification('Date filter cleared', 'info');
    }
  }, [originalResults]);

  // Custom date range search function
  const handleCustomDateRangeSearch = useCallback(async (startDateStr: string, endDateStr: string) => {
    if (productNames.length === 0 && uniqueProductNames.length === 0) {
      showNotification('Please select products first', 'warning');
      return;
    }

    setIsLoading(true);
    
    try {
      const filters: SearchFilters = {
        ...buildFilters(),
        date_mode: 'range',
        start_date: startDateStr,
        end_date: endDateStr
      };

      let response: SearchResponse;
      if (productNames.length > 0) {
        response = await tradeAPI.searchProducts(productNames, filters);
      } else {
        response = await tradeAPI.searchUniqueProducts(uniqueProductNames, filters);
      }

      setSearchResults(response);
      setOriginalResults(response);
      setCurrentPage(1);
      
      showNotification(`Custom date range applied: ${response.count} results`, 'success');
    } catch (error) {
      console.error('Custom date search error:', error);
      showNotification('Date range search failed', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [productNames, uniqueProductNames, hsCode, importerId, portName]);

  // Top importers function
  const fetchTopImporters = useCallback(async () => {
    if (productNames.length === 0 && uniqueProductNames.length === 0) {
      showNotification('Please search for products first', 'warning');
      return;
    }

    setLoadingTopImporters(true);
    
    try {
      const filters = buildFilters();
      let response: TopImportersResponse;

      if (productNames.length > 0) {
        response = await tradeAPI.getTopImportersForProducts(productNames, filters);
      } else {
        response = await tradeAPI.getTopImportersForUniqueProducts(uniqueProductNames, filters);
      }

      setTopImporters(response);
      setShowTopImporters(true);
      showNotification(`Found top ${response.data.length} importers`, 'success');
    } catch (error) {
      console.error('Top importers error:', error);
      showNotification('Failed to fetch top importers', 'error');
    } finally {
      setLoadingTopImporters(false);
    }
  }, [productNames, uniqueProductNames, hsCode, importerId, portName, dateMode, singleDate, startDate, endDate]);

  // Export function
  const exportResults = useCallback(() => {
    if (!searchResults || searchResults.data.length === 0) {
      showNotification('No data to export', 'warning');
      return;
    }

    try {
      const headers = [
        'System ID', 'Registration Date', 'Month Year', 'HS Code', 'Chapter',
        'Product Name', 'Unique Product Name', 'Quantity', 'Unit', 'Unit Price USD',
        'Total Value USD', 'Importer ID', 'Importer Name', 'City', 'CHA Number',
        'Type', 'Supplier Name', 'Supplier Address', 'Indian Port', 'Foreign Port',
        'Origin Country', 'Exchange Rate USD', 'Duty'
      ];

      const csvContent = [
        headers.join(','),
        ...searchResults.data.map(row => [
          row.system_id || '',
          row.reg_date || '',
          row.month_year || '',
          row.hs_code || '',
          row.chapter || '',
          `"${(row.product_name || '').replace(/"/g, '""')}"`,
          `"${(row.unique_product_name || '').replace(/"/g, '""')}"`,
          row.quantity || '',
          row.unit_quantity || '',
          row.unit_price_usd || '',
          row.total_value_usd || '',
          row.importer_id || '',
          `"${(row.true_importer_name || '').replace(/"/g, '""')}"`,
          row.city || '',
          row.cha_number || '',
          row.type || '',
          `"${(row.true_supplier_name || '').replace(/"/g, '""')}"`,
          `"${(row.supplier_address || '').replace(/"/g, '""')}"`,
          row.indian_port || '',
          row.foreign_port || '',
          row.origin_country || '',
          row.exchange_rate_usd || '',
          row.duty || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `trade_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Data exported successfully', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showNotification('Export failed', 'error');
    }
  }, [searchResults]);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Fade in={true} timeout={1000}>
          <Box>
            {/* Header */}
            <Header />

            <Card 
              elevation={24}
              sx={{ 
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                overflow: 'visible',
                position: 'relative',
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
                {/* Search Form */}
                <SearchForm
                  productNames={productNames}
                  setProductNames={setProductNames}
                  uniqueProductNames={uniqueProductNames}
                  setUniqueProductNames={setUniqueProductNames}
                  entities={entities}
                  setEntities={setEntities}
                  isLoading={isLoading}
                  handlePrimarySearch={handlePrimarySearch}
                  clearSearch={clearSearch}
                  hasData={!!hasData}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  exportResults={exportResults}
                  fetchTopImporters={fetchTopImporters}
                  loadingTopImporters={loadingTopImporters}
                />

                {/* Advanced Filters */}
                <AdvancedFilters
                  showFilters={showFilters}
                  hsCode={hsCode}
                  setHsCode={setHsCode}
                  importerId={importerId}
                  setImporterId={setImporterId}
                  portName={portName}
                  setPortName={setPortName}
                  dateMode={dateMode}
                  setDateMode={setDateMode}
                  singleDate={singleDate}
                  setSingleDate={setSingleDate}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                />

                {/* Quick Date Filters */}
                <QuickDateFilters
                  hasData={!!hasData}
                  isLoading={isLoading}
                  handleQuickDateFilterExistingData={handleQuickDateFilterExistingData}
                  handleClearDateFilter={handleClearDateFilter}
                  handleCustomDateRangeSearch={handleCustomDateRangeSearch}
                  dateMode={dateMode}
                  singleDate={singleDate}
                  startDate={startDate}
                  endDate={endDate}
                />

                {/* Results Table */}
                <ResultsTable
                  hasData={!!hasData}
                  searchResults={searchResults}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                />

                {/* Top Importers Section */}
                <TopImportersSection
                  showTopImporters={showTopImporters}
                  topImporters={topImporters}
                />
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Container>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}