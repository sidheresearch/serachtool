import { Box, Typography, Grid, Button, CircularProgress } from '@mui/material';
import { Search, Business, Tag, FilterList, Download, TrendingUp } from '@mui/icons-material';
import { AutocompleteInput } from './AutocompleteInput';

interface SearchFormProps {
  productNames: string[];
  setProductNames: (names: string[]) => void;
  uniqueProductNames: string[];
  setUniqueProductNames: (names: string[]) => void;
  entities: string[];
  setEntities: (entities: string[]) => void;
  isLoading: boolean;
  handlePrimarySearch: () => void;
  clearSearch: () => void;
  hasData: boolean;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  exportResults: () => void;
  fetchTopImporters: () => void;
  loadingTopImporters: boolean;
}

export function SearchForm({
  productNames,
  setProductNames,
  uniqueProductNames,
  setUniqueProductNames,
  entities,
  setEntities,
  isLoading,
  handlePrimarySearch,
  clearSearch,
  hasData,
  showFilters,
  setShowFilters,
  exportResults,
  fetchTopImporters,
  loadingTopImporters
}: SearchFormProps) {
  return (
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
        🔍 Search Products
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
        
        {hasData && (
          <>
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

            {(productNames.length > 0 || uniqueProductNames.length > 0) && (
              <Button
                variant="outlined"
                size="large"
                onClick={fetchTopImporters}
                disabled={loadingTopImporters}
                sx={{
                  borderRadius: '16px',
                  px: 4,
                  py: 2,
                  fontSize: '16px',
                  fontWeight: 600,
                  borderColor: '#f59e0b',
                  color: '#f59e0b',
                  '&:hover': {
                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                    borderColor: '#f59e0b',
                  },
                }}
                startIcon={loadingTopImporters ? <CircularProgress size={20} /> : <TrendingUp />}
              >
                {loadingTopImporters ? 'Loading...' : 'Top Importers'}
              </Button>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}