'use client';
import { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Typography, 
  Box, 
  InputAdornment,
  Fade,
  Card,
  CardContent,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Button,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  Pagination
} from '@mui/material';
import { Grid } from '@mui/material';
import { Search, Business, Tag, DateRange, CalendarToday, QrCode, PersonPin, LocationOn, FilterList, Download, Visibility } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { AutocompleteInput } from './components/AutocompleteInput';
import { tradeAPI, SearchResponse } from './utils/api';

export default function Home() {
  // State management
  const [productNames, setProductNames] = useState<string[]>([]);
  const [uniqueProductNames, setUniqueProductNames] = useState<string[]>([]);
  const [entities, setEntities] = useState<string[]>([]);
  
  const [hsCode, setHsCode] = useState('');
  const [importerId, setImporterId] = useState('');
  const [portName, setPortName] = useState('');
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const [singleDate, setSingleDate] = useState<Dayjs | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  
  // API state
  const [isLoading, setIsLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  const handlePrimarySearch = async () => {
    // Check if at least one primary field is filled
    if (productNames.length === 0 && uniqueProductNames.length === 0 && entities.length === 0) {
      setSearchError('Please select at least one item from the suggestions');
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    setCurrentPage(1);
    
    try {
      const filters = {
        hs_code: hsCode || undefined,
        importer_id: importerId || undefined,
        port_name: portName || undefined,
        date_mode: dateMode,
        single_date: dateMode === 'single' && singleDate ? singleDate.format('YYYY-MM-DD') : undefined,
        start_date: dateMode === 'range' && startDate ? startDate.format('YYYY-MM-DD') : undefined,
        end_date: dateMode === 'range' && endDate ? endDate.format('YYYY-MM-DD') : undefined,
      };

      let results: SearchResponse;
      
      // Call appropriate API based on what's selected
      if (productNames.length > 0) {
        results = await tradeAPI.searchProducts(productNames, filters);
        setSuccessMessage(`Found ${results.count} products matching your search criteria`);
      } else if (uniqueProductNames.length > 0) {
        results = await tradeAPI.searchUniqueProducts(uniqueProductNames, filters);
        setSuccessMessage(`Found ${results.count} unique products matching your search criteria`);
      } else if (entities.length > 0) {
        results = await tradeAPI.searchEntities(entities, filters);
        setSuccessMessage(`Found ${results.count} records for the selected entities`);
      } else {
        throw new Error('No search criteria provided');
      }

      console.log('Search results:', results);
      setSearchResults(results);
      setHasData(true);
      setShowFilters(true);
      
    } catch (error) {
      console.error('Search failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Search failed. Please try again.';
      setSearchError(errorMessage);
      setSearchResults(null);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setProductNames([]);
    setUniqueProductNames([]);
    setEntities([]);
    setHsCode('');
    setImporterId('');
    setPortName('');
    setSingleDate(null);
    setStartDate(null);
    setEndDate(null);
    setHasData(false);
    setSearchResults(null);
    setSearchError(null);
    setShowFilters(false);
    setCurrentPage(1);
    setSuccessMessage(null);
  };

  const exportResults = () => {
    if (!searchResults?.data?.length) return;
    
    // Create CSV content
    const headers = Object.keys(searchResults.data[0]).join(',');
    const rows = searchResults.data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const totalPages = searchResults ? Math.ceil(searchResults.data.length / itemsPerPage) : 0;
  const paginatedData = searchResults?.data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              {/* Header Section */}
              <Box textAlign="center" mb={6}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 800,
                    color: 'white',
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    mb: 2,
                  }}
                >
                  🔍 Trade Analytics Tool
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    maxWidth: 600, 
                    mx: 'auto',
                    fontWeight: 400,
                    textShadow: '0 1px 5px rgba(0,0,0,0.2)',
                  }}
                >
                  Discover and analyze trade data with advanced search capabilities
                </Typography>
              </Box>

              {/* Main Search Card */}
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
                  {/* Primary Search Section */}
                  <Box mb={4}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        mb: 1, 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      🎯 Search Products
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                      Start typing to see suggestions and select from the dropdown
                    </Typography>

                    <Grid container spacing={4}>
                      <Grid item xs={12}>
                        <AutocompleteInput
                          label="Search by Product Name"
                          placeholder="Type to search products..."
                          searchType="product_name"
                          value={productNames}
                          onChange={setProductNames}
                          disabled={isLoading}
                          icon={<Search sx={{ color: '#667eea' }} />}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '16px',
                              minHeight: '72px',
                              fontSize: '18px',
                              minWidth: '100%',
                              transition: 'all 0.3s ease',
                              backgroundColor: 'rgba(102, 126, 234, 0.03)',
                              border: '2px solid rgba(102, 126, 234, 0.1)',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                                borderColor: 'rgba(102, 126, 234, 0.3)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 30px rgba(102, 126, 234, 0.25)',
                                borderColor: '#667eea',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '18px',
                              fontWeight: 500,
                            },
                            '& .MuiAutocomplete-input': {
                              fontSize: '18px',
                              padding: '16px 8px',
                            },
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <AutocompleteInput
                          label="Search by Unique Product Name"
                          placeholder="Type to search unique products..."
                          searchType="unique_product_name"
                          value={uniqueProductNames}
                          onChange={setUniqueProductNames}
                          disabled={isLoading}
                          icon={<Tag sx={{ color: '#764ba2' }} />}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '16px',
                              minHeight: '72px',
                              fontSize: '18px',
                              minWidth: '100%',
                              transition: 'all 0.3s ease',
                              backgroundColor: 'rgba(118, 75, 162, 0.03)',
                              border: '2px solid rgba(118, 75, 162, 0.1)',
                              '&:hover': {
                                backgroundColor: 'rgba(118, 75, 162, 0.08)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(118, 75, 162, 0.15)',
                                borderColor: 'rgba(118, 75, 162, 0.3)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(118, 75, 162, 0.08)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 30px rgba(118, 75, 162, 0.25)',
                                borderColor: '#764ba2',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '18px',
                              fontWeight: 500,
                            },
                            '& .MuiAutocomplete-input': {
                              fontSize: '18px',
                              padding: '16px 8px',
                            },
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <AutocompleteInput
                          label="Search by Entity"
                          placeholder="Type to search entities..."
                          searchType="entity"
                          value={entities}
                          onChange={setEntities}
                          disabled={isLoading}
                          icon={<Business sx={{ color: '#10b981' }} />}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '16px',
                              minHeight: '72px',
                              fontSize: '18px',
                              minWidth: '100%',
                              transition: 'all 0.3s ease',
                              backgroundColor: 'rgba(16, 185, 129, 0.03)',
                              border: '2px solid rgba(16, 185, 129, 0.1)',
                              '&:hover': {
                                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)',
                                borderColor: 'rgba(16, 185, 129, 0.3)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 30px rgba(16, 185, 129, 0.25)',
                                borderColor: '#10b981',
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '18px',
                              fontWeight: 500,
                            },
                            '& .MuiAutocomplete-input': {
                              fontSize: '18px',
                              padding: '16px 8px',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Search Action Buttons */}
                    <Box sx={{ mt: 5, display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handlePrimarySearch}
                        disabled={isLoading || (productNames.length === 0 && uniqueProductNames.length === 0 && entities.length === 0)}
                        sx={{
                          borderRadius: '16px',
                          px: 6,
                          py: 2,
                          fontSize: '16px',
                          fontWeight: 600,
                          minWidth: '200px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                          },
                          '&:disabled': {
                            background: 'rgba(0, 0, 0, 0.12)',
                            transform: 'none',
                            boxShadow: 'none',
                          }
                        }}
                        startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <Search />}
                      >
                        {isLoading ? 'Searching...' : 'Search Products'}
                      </Button>
                      
                      {(productNames.length > 0 || uniqueProductNames.length > 0 || entities.length > 0) && (
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={clearSearch}
                          sx={{
                            borderRadius: '16px',
                            px: 6,
                            py: 2,
                            fontSize: '16px',
                            fontWeight: 600,
                            minWidth: '150px',
                            borderColor: 'rgba(102, 126, 234, 0.3)',
                            color: '#667eea',
                            borderWidth: '2px',
                            '&:hover': {
                              borderColor: '#667eea',
                              backgroundColor: 'rgba(102, 126, 234, 0.05)',
                              transform: 'translateY(-2px)',
                              borderWidth: '2px',
                            },
                          }}
                        >
                          Clear All
                        </Button>
                      )}

                      {hasData && (
                        <>
                          <Button
                            variant="text"
                            size="large"
                            onClick={() => setShowFilters(!showFilters)}
                            sx={{
                              borderRadius: '16px',
                              px: 4,
                              py: 2,
                              fontSize: '16px',
                              fontWeight: 600,
                              color: '#667eea',
                              '&:hover': {
                                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                              },
                            }}
                            startIcon={<FilterList />}
                          >
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                          </Button>
                          
                          <Button
                            variant="outlined"
                            size="large"
                            onClick={exportResults}
                            sx={{
                              borderRadius: '16px',
                              px: 4,
                              py: 2,
                              fontSize: '16px',
                              fontWeight: 600,
                              borderColor: '#10b981',
                              color: '#10b981',
                              '&:hover': {
                                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                borderColor: '#10b981',
                              },
                            }}
                            startIcon={<Download />}
                          >
                            Export CSV
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Additional Filters - Collapsible */}
                  {showFilters && (
                    <Fade in={showFilters} timeout={500}>
                      <Box>
                        <Divider sx={{ my: 4, borderColor: 'rgba(102, 126, 234, 0.1)', borderWidth: '1px' }} />

                        <Typography 
                          variant="h5" 
                          sx={{ 
                            mb: 1, 
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          🔧 Advanced Filters
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                          Refine your search results with these additional filters
                        </Typography>

                        <Grid container spacing={4}>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="HS Code"
                              variant="outlined"
                              value={hsCode}
                              onChange={(e) => setHsCode(e.target.value)}
                              placeholder="Enter HS code..."
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '16px',
                                  minHeight: '56px',
                                  fontSize: '16px',
                                  transition: 'all 0.3s ease',
                                  backgroundColor: 'rgba(99, 102, 241, 0.03)',
                                  border: '2px solid rgba(99, 102, 241, 0.1)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                                    borderColor: 'rgba(99, 102, 241, 0.3)',
                                  },
                                  '&.Mui-focused': {
                                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                                    borderColor: '#6366f1',
                                  },
                                },
                                '& .MuiInputLabel-root': {
                                  fontSize: '16px',
                                  fontWeight: 500,
                                },
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <QrCode sx={{ color: '#6366f1' }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Importer ID"
                              variant="outlined"
                              value={importerId}
                              onChange={(e) => setImporterId(e.target.value)}
                              placeholder="Enter importer ID..."
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '16px',
                                  minHeight: '56px',
                                  fontSize: '16px',
                                  transition: 'all 0.3s ease',
                                  backgroundColor: 'rgba(168, 85, 247, 0.03)',
                                  border: '2px solid rgba(168, 85, 247, 0.1)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(168, 85, 247, 0.08)',
                                    borderColor: 'rgba(168, 85, 247, 0.3)',
                                  },
                                  '&.Mui-focused': {
                                    backgroundColor: 'rgba(168, 85, 247, 0.08)',
                                    borderColor: '#a855f7',
                                  },
                                },
                                '& .MuiInputLabel-root': {
                                  fontSize: '16px',
                                  fontWeight: 500,
                                },
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonPin sx={{ color: '#a855f7' }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Port Name"
                              variant="outlined"
                              value={portName}
                              onChange={(e) => setPortName(e.target.value)}
                              placeholder="Enter port name..."
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '16px',
                                  minHeight: '56px',
                                  fontSize: '16px',
                                  transition: 'all 0.3s ease',
                                  backgroundColor: 'rgba(59, 130, 246, 0.03)',
                                  border: '2px solid rgba(59, 130, 246, 0.1)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                    borderColor: 'rgba(59, 130, 246, 0.3)',
                                  },
                                  '&.Mui-focused': {
                                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                    borderColor: '#3b82f6',
                                  },
                                },
                                '& .MuiInputLabel-root': {
                                  fontSize: '16px',
                                  fontWeight: 500,
                                },
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LocationOn sx={{ color: '#3b82f6' }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        </Grid>

                        {/* Date Selection */}
                        <Box sx={{ mt: 5 }}>
                          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#667eea' }}>
                            📅 Date Range
                          </Typography>
                          
                          <FormControl component="fieldset" sx={{ mb: 3 }}>
                            <RadioGroup
                              row
                              value={dateMode}
                              onChange={(e) => setDateMode(e.target.value as 'single' | 'range')}
                              sx={{ gap: 4 }}
                            >
                              <FormControlLabel 
                                value="single" 
                                control={<Radio sx={{ color: '#667eea' }} />} 
                                label={<Typography variant="body1" fontWeight={500}>Single Date</Typography>}
                              />
                              <FormControlLabel 
                                value="range" 
                                control={<Radio sx={{ color: '#667eea' }} />} 
                                label={<Typography variant="body1" fontWeight={500}>Date Range</Typography>}
                              />
                            </RadioGroup>
                          </FormControl>

                          <Grid container spacing={4}>
                            {dateMode === 'single' ? (
                              <Grid item xs={12} md={6}>
                                <DatePicker
                                  label="Select Date"
                                  value={singleDate}
                                  onChange={(newValue) => setSingleDate(newValue)}
                                  slotProps={{
                                    textField: {
                                      fullWidth: true,
                                      sx: {
                                        '& .MuiOutlinedInput-root': {
                                          borderRadius: '16px',
                                          minHeight: '56px',
                                          fontSize: '16px',
                                          backgroundColor: 'rgba(244, 114, 182, 0.03)',
                                          border: '2px solid rgba(244, 114, 182, 0.1)',
                                          '&:hover': {
                                            backgroundColor: 'rgba(244, 114, 182, 0.08)',
                                            borderColor: 'rgba(244, 114, 182, 0.3)',
                                          },
                                          '&.Mui-focused': {
                                            backgroundColor: 'rgba(244, 114, 182, 0.08)',
                                            borderColor: '#f472b6',
                                          },
                                        },
                                        '& .MuiInputLabel-root': {
                                          fontSize: '16px',
                                          fontWeight: 500,
                                        },
                                      },
                                      InputProps: {
                                        startAdornment: (
                                          <InputAdornment position="start">
                                            <CalendarToday sx={{ color: '#f472b6' }} />
                                          </InputAdornment>
                                        ),
                                      }
                                    }
                                  }}
                                />
                              </Grid>
                            ) : (
                              <>
                                <Grid item xs={12} md={6}>
                                  <DatePicker
                                    label="Start Date"
                                    value={startDate}
                                    onChange={(newValue) => setStartDate(newValue)}
                                    slotProps={{
                                      textField: {
                                        fullWidth: true,
                                        sx: {
                                          '& .MuiOutlinedInput-root': {
                                            borderRadius: '16px',
                                            minHeight: '56px',
                                            fontSize: '16px',
                                            backgroundColor: 'rgba(244, 114, 182, 0.03)',
                                            border: '2px solid rgba(244, 114, 182, 0.1)',
                                            '&:hover': {
                                              backgroundColor: 'rgba(244, 114, 182, 0.08)',
                                              borderColor: 'rgba(244, 114, 182, 0.3)',
                                            },
                                            '&.Mui-focused': {
                                              backgroundColor: 'rgba(244, 114, 182, 0.08)',
                                              borderColor: '#f472b6',
                                            },
                                          },
                                          '& .MuiInputLabel-root': {
                                            fontSize: '16px',
                                            fontWeight: 500,
                                          },
                                        },
                                        InputProps: {
                                          startAdornment: (
                                            <InputAdornment position="start">
                                              <DateRange sx={{ color: '#f472b6' }} />
                                            </InputAdornment>
                                          ),
                                        }
                                      }
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <DatePicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={(newValue) => setEndDate(newValue)}
                                    minDate={startDate || undefined}
                                    slotProps={{
                                      textField: {
                                        fullWidth: true,
                                        sx: {
                                          '& .MuiOutlinedInput-root': {
                                            borderRadius: '16px',
                                            minHeight: '56px',
                                            fontSize: '16px',
                                            backgroundColor: 'rgba(244, 114, 182, 0.03)',
                                            border: '2px solid rgba(244, 114, 182, 0.1)',
                                            '&:hover': {
                                              backgroundColor: 'rgba(244, 114, 182, 0.08)',
                                              borderColor: 'rgba(244, 114, 182, 0.3)',
                                            },
                                            '&.Mui-focused': {
                                              backgroundColor: 'rgba(244, 114, 182, 0.08)',
                                              borderColor: '#f472b6',
                                            },
                                          },
                                          '& .MuiInputLabel-root': {
                                            fontSize: '16px',
                                            fontWeight: 500,
                                          },
                                        },
                                        InputProps: {
                                          startAdornment: (
                                            <InputAdornment position="start">
                                              <DateRange sx={{ color: '#f472b6' }} />
                                            </InputAdornment>
                                          ),
                                        }
                                      }
                                    }}
                                  />
                                </Grid>
                              </>
                            )}
                          </Grid>
                        </Box>
                      </Box>
                    </Fade>
                  )}

                  {/* Results Section */}
                  {hasData && searchResults && (
                    <Fade in={hasData} timeout={800}>
                      <Box sx={{ mt: 6 }}>
                        <Divider sx={{ mb: 4, borderColor: 'rgba(102, 126, 234, 0.1)', borderWidth: '1px' }} />
                        
                        <Paper
                          elevation={8}
                          sx={{ 
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                            border: '1px solid rgba(102, 126, 234, 0.1)',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Results Header */}
                          <Box sx={{ p: 4, pb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Typography 
                                variant="h5" 
                                sx={{ 
                                  fontWeight: 700,
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  backgroundClip: 'text',
                                }}
                              >
                                📊 Search Results
                              </Typography>
                              <Chip 
                                label={`${searchResults.count} total items`}
                                variant="outlined"
                                sx={{ 
                                  fontWeight: 600,
                                  borderColor: '#667eea',
                                  color: '#667eea',
                                  fontSize: '14px'
                                }}
                              />
                              {searchResults.error && (
                                <Chip 
                                  label="⚠️ Partial results"
                                  color="warning"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                            </Box>
                            
                            {searchResults.data.length > 0 && (
                              <Typography variant="body2" color="text.secondary">
                                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, searchResults.data.length)} of {searchResults.data.length} results
                              </Typography>
                            )}
                          </Box>
                          
                          {/* Results Table */}
                          {searchResults.data.length > 0 ? (
                            <Box>
                              <TableContainer sx={{ maxHeight: '600px' }}>
                                <Table stickyHeader>
                                  <TableHead>
                                    <TableRow>
                                      {Object.keys(searchResults.data[0]).slice(0, 6).map((key) => (
                                        <TableCell 
                                          key={key}
                                          sx={{ 
                                            fontWeight: 600,
                                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                            borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
                                          }}
                                        >
                                          {key.replace(/_/g, ' ').toUpperCase()}
                                        </TableCell>
                                      ))}
                                      <TableCell 
                                        sx={{ 
                                          fontWeight: 600,
                                          backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                          borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
                                        }}
                                      >
                                        ACTIONS
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {paginatedData.map((row, index) => (
                                      <TableRow 
                                        key={index}
                                        sx={{ 
                                          '&:hover': { 
                                            backgroundColor: 'rgba(102, 126, 234, 0.02)' 
                                          },
                                          '&:nth-of-type(even)': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.01)'
                                          }
                                        }}
                                      >
                                        {Object.values(row).slice(0, 6).map((value, cellIndex) => (
                                          <TableCell key={cellIndex} sx={{ fontSize: '14px' }}>
                                            {typeof value === 'string' && value.length > 50 
                                              ? `${value.substring(0, 50)}...` 
                                              : String(value || '-')
                                            }
                                          </TableCell>
                                        ))}

                                        <TableCell>
                                          <Button
                                            size="small"
                                            startIcon={<Visibility />}
                                            onClick={() => {
                                              console.log('View details:', row);
                                              // Add view details functionality here
                                            }}
                                            sx={{ 
                                              fontSize: '12px',
                                              color: '#667eea',
                                              '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' }
                                            }}
                                          >
                                            View
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                              
                              {/* Pagination */}
                              {totalPages > 1 && (
                                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                                  <Pagination 
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={(_, page) => setCurrentPage(page)}
                                    color="primary"
                                    size="large"
                                    sx={{
                                      '& .MuiPaginationItem-root': {
                                        fontSize: '16px',
                                        fontWeight: 500,
                                      }
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>
                          ) : (
                            <Box 
                              sx={{ 
                                textAlign: 'center', 
                                py: 8,
                                px: 4
                              }}
                            >
                              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                No results found
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Try adjusting your search criteria or filters
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    </Fade>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!searchError}
        autoHideDuration={8000}
        onClose={() => setSearchError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSearchError(null)} severity="error" sx={{ width: '100%' }}>
          {searchError}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}
