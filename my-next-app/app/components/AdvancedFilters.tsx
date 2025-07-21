import { 
  Box, 
  Typography, 
  Grid, 
  TextField, 
  InputAdornment, 
  FormControl, 
  RadioGroup, 
  FormControlLabel, 
  Radio,
  Fade,
  Divider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { QrCode, PersonPin, LocationOn, CalendarToday, DateRange } from '@mui/icons-material';
import { Dayjs } from 'dayjs';

interface AdvancedFiltersProps {
  showFilters: boolean;
  hsCode: string;
  setHsCode: (code: string) => void;
  importerId: string;
  setImporterId: (id: string) => void;
  portName: string;
  setPortName: (name: string) => void;
  dateMode: 'single' | 'range';
  setDateMode: (mode: 'single' | 'range') => void;
  singleDate: Dayjs | null;
  setSingleDate: (date: Dayjs | null) => void;
  startDate: Dayjs | null;
  setStartDate: (date: Dayjs | null) => void;
  endDate: Dayjs | null;
  setEndDate: (date: Dayjs | null) => void;
}

export function AdvancedFilters({
  showFilters,
  hsCode,
  setHsCode,
  importerId,
  setImporterId,
  portName,
  setPortName,
  dateMode,
  setDateMode,
  singleDate,
  setSingleDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}: AdvancedFiltersProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Fade in={showFilters} timeout={500}>
        <Box sx={{ display: showFilters ? 'block' : 'none' }}>
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

          {/* Basic Filters Row */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
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

          {/* Filter Application Note */}
          <Box sx={{ 
            mt: 4, 
            p: 3, 
            backgroundColor: 'rgba(102, 126, 234, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              💡 <strong>Note:</strong> These filters will be applied when you click "Search Products" button. 
              Make sure to set your filters before searching.
            </Typography>
          </Box>
        </Box>
      </Fade>
    </LocalizationProvider>
  );
}