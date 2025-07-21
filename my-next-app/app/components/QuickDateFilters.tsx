import { Box, Typography, Button, Fade, Divider } from '@mui/material';
import { DateRange } from '@mui/icons-material';
import { Dayjs } from 'dayjs';

interface QuickDateFiltersProps {
  hasData: boolean;
  isLoading: boolean;
  handleQuickDateFilterExistingData: (days: number) => void;
  handleClearDateFilter: () => void;
  handleCustomDateRangeSearch: (startDate: string, endDate: string) => void;
  dateMode: 'single' | 'range';
  singleDate: Dayjs | null;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

export function QuickDateFilters({
  hasData,
  isLoading,
  handleQuickDateFilterExistingData,
  handleClearDateFilter,
  handleCustomDateRangeSearch,
  dateMode,
  singleDate,
  startDate,
  endDate
}: QuickDateFiltersProps) {
  if (!hasData) return null;

  return (
    <Fade in={hasData} timeout={800}>
      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 4, borderColor: 'rgba(244, 114, 182, 0.1)', borderWidth: '1px' }} />
        
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 1, 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #7285f4ff 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ⚡ Quick Date Filters
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Apply common date ranges with one click
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap', 
          mb: 3,
          p: 3,
          backgroundColor: 'rgba(244, 114, 182, 0.03)',
          borderRadius: '16px',
          border: '1px solid rgba(244, 114, 182, 0.1)'
        }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleQuickDateFilterExistingData(7)}
            disabled={isLoading || !hasData}
            sx={{ 
              borderRadius: '12px', 
              fontSize: '12px',
              fontWeight: 600,
              borderColor: '#f472b6',
              color: '#f472b6',
              '&:hover': {
                backgroundColor: 'rgba(244, 114, 182, 0.1)',
                borderColor: '#f472b6'
              }
            }}
          >
            Last 7 Days
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleQuickDateFilterExistingData(15)}
            disabled={isLoading || !hasData}
            sx={{ 
              borderRadius: '12px', 
              fontSize: '12px',
              fontWeight: 600,
              borderColor: '#f472b6',
              color: '#f472b6',
              '&:hover': {
                backgroundColor: 'rgba(244, 114, 182, 0.1)',
                borderColor: '#f472b6'
              }
            }}
          >
            Last 15 Days
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleQuickDateFilterExistingData(30)}
            disabled={isLoading || !hasData}
            sx={{ 
              borderRadius: '12px', 
              fontSize: '12px',
              fontWeight: 600,
              borderColor: '#f472b6',
              color: '#f472b6',
              '&:hover': {
                backgroundColor: 'rgba(244, 114, 182, 0.1)',
                borderColor: '#f472b6'
              }
            }}
          >
            Last 30 Days
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleQuickDateFilterExistingData(90)}
            disabled={isLoading || !hasData}
            sx={{ 
              borderRadius: '12px', 
              fontSize: '12px',
              fontWeight: 600,
              borderColor: '#f472b6',
              color: '#f472b6',
              '&:hover': {
                backgroundColor: 'rgba(244, 114, 182, 0.1)',
                borderColor: '#f472b6'
              }
            }}
          >
            Last 90 Days
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleQuickDateFilterExistingData(180)}
            disabled={isLoading || !hasData}
            sx={{ 
              borderRadius: '12px', 
              fontSize: '12px',
              fontWeight: 600,
              borderColor: '#f472b6',
              color: '#f472b6',
              '&:hover': {
                backgroundColor: 'rgba(244, 114, 182, 0.1)',
                borderColor: '#f472b6'
              }
            }}
          >
            Last 6 Months
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleQuickDateFilterExistingData(365)}
            disabled={isLoading || !hasData}
            sx={{ 
              borderRadius: '12px', 
              fontSize: '12px',
              fontWeight: 600,
              borderColor: '#f472b6',
              color: '#f472b6',
              '&:hover': {
                backgroundColor: 'rgba(244, 114, 182, 0.1)',
                borderColor: '#f472b6'
              }
            }}
          >
            Last Year
          </Button>

          <Button
            variant="text"
            size="small"
            onClick={handleClearDateFilter}
            disabled={isLoading}
            sx={{ 
              borderRadius: '12px', 
              fontSize: '12px',
              fontWeight: 600,
              color: '#6b7280',
              '&:hover': {
                backgroundColor: 'rgba(107, 114, 128, 0.1)'
              }
            }}
          >
            Clear Dates
          </Button>
        </Box>

        {/* Custom Date Range Application Button */}
        {((dateMode === 'single' && singleDate) || (dateMode === 'range' && startDate && endDate)) && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            mt: 2
          }}>
            <Button
              variant="contained"
              size="medium"
              onClick={() => {
                if (dateMode === 'single' && singleDate) {
                  handleCustomDateRangeSearch(
                    singleDate.format('YYYY-MM-DD'),
                    singleDate.format('YYYY-MM-DD')
                  );
                } else if (dateMode === 'range' && startDate && endDate) {
                  handleCustomDateRangeSearch(
                    startDate.format('YYYY-MM-DD'),
                    endDate.format('YYYY-MM-DD')
                  );
                }
              }}
              disabled={isLoading}
              sx={{
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                fontSize: '14px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                }
              }}
              startIcon={<DateRange />}
            >
              Apply Custom Date Range
            </Button>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          💡 <strong>Tip:</strong> Use quick filters above for common date ranges, or set custom dates in the pickers above and click "Apply Custom Date Range"
        </Typography>
      </Box>
    </Fade>
  );
}