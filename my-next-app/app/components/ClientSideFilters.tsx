import { 
  Box, 
  Typography, 
  Grid, 
  TextField, 
  InputAdornment, 
  Button,
  Fade,
  Divider,
  Chip
} from '@mui/material';
import { QrCode, PersonPin, LocationOn, Clear, Search } from '@mui/icons-material';
import { useState } from 'react';

interface ClientSideFiltersProps {
  hasData: boolean;
  onApplyFilters: (filters: {
    hsCode: string;
    importerId: string;
    portName: string;
    importerName: string;
  }) => void;
  onClearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export function ClientSideFilters({
  hasData,
  onApplyFilters,
  onClearFilters,
  filteredCount,
  totalCount
}: ClientSideFiltersProps) {
  const [hsCode, setHsCode] = useState('');
  const [importerId, setImporterId] = useState('');
  const [portName, setPortName] = useState('');
  const [importerName, setImporterName] = useState('');

  const handleApplyFilters = () => {
    onApplyFilters({
      hsCode: hsCode.trim(),
      importerId: importerId.trim(),
      portName: portName.trim(),
      importerName: importerName.trim()
    });
  };

  const handleClearFilters = () => {
    setHsCode('');
    setImporterId('');
    setPortName('');
    setImporterName('');
    onClearFilters();
  };

  const hasActiveFilters = hsCode || importerId || portName || importerName;
  const isFiltered = filteredCount !== totalCount;

  if (!hasData) return null;

  return (
    <Fade in={hasData} timeout={800}>
      <Box sx={{ mt: 4 }}>
        <Divider sx={{ mb: 4, borderColor: 'rgba(16, 185, 129, 0.1)', borderWidth: '1px' }} />
        
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 1, 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          🔍 Filter Current Results
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Filter your current search results instantly without making new API calls
        </Typography>

        {/* Filter Status */}
        {isFiltered && (
          <Box sx={{ mb: 3 }}>
            <Chip
              label={`Showing ${filteredCount} of ${totalCount} results`}
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: 600,
                borderColor: '#10b981',
                color: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.05)'
              }}
            />
          </Box>
        )}

        <Box sx={{ 
          p: 4,
          backgroundColor: 'rgba(16, 185, 129, 0.03)',
          borderRadius: '16px',
          border: '1px solid rgba(16, 185, 129, 0.1)'
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Filter by HS Code"
                variant="outlined"
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
                placeholder="Enter HS code to filter..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    minHeight: '48px',
                    fontSize: '14px',
                    backgroundColor: 'rgba(16, 185, 129, 0.02)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      borderColor: 'rgba(16, 185, 129, 0.4)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      borderColor: '#10b981',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '14px',
                    fontWeight: 500,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCode sx={{ color: '#10b981', fontSize: '20px' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Filter by Importer ID"
                variant="outlined"
                value={importerId}
                onChange={(e) => setImporterId(e.target.value)}
                placeholder="Enter importer ID to filter..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    minHeight: '48px',
                    fontSize: '14px',
                    backgroundColor: 'rgba(16, 185, 129, 0.02)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      borderColor: 'rgba(16, 185, 129, 0.4)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      borderColor: '#10b981',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '14px',
                    fontWeight: 500,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonPin sx={{ color: '#10b981', fontSize: '20px' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Filter by Port Name"
                variant="outlined"
                value={portName}
                onChange={(e) => setPortName(e.target.value)}
                placeholder="Enter port name to filter..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    minHeight: '48px',
                    fontSize: '14px',
                    backgroundColor: 'rgba(16, 185, 129, 0.02)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      borderColor: 'rgba(16, 185, 129, 0.4)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      borderColor: '#10b981',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '14px',
                    fontWeight: 500,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: '#10b981', fontSize: '20px' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Filter by Importer Name"
                variant="outlined"
                value={importerName}
                onChange={(e) => setImporterName(e.target.value)}
                placeholder="Enter importer name to filter..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    minHeight: '48px',
                    fontSize: '14px',
                    backgroundColor: 'rgba(16, 185, 129, 0.02)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      borderColor: 'rgba(16, 185, 129, 0.4)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      borderColor: '#10b981',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '14px',
                    fontWeight: 500,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonPin sx={{ color: '#10b981', fontSize: '20px' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Filter Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center',
            mt: 3
          }}>
            <Button
              variant="contained"
              size="medium"
              onClick={handleApplyFilters}
              disabled={!hasActiveFilters}
              sx={{
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                fontSize: '14px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                },
                '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                }
              }}
              startIcon={<Search />}
            >
              Apply Filters
            </Button>
            
            {(hasActiveFilters || isFiltered) && (
              <Button
                variant="outlined"
                size="medium"
                onClick={handleClearFilters}
                sx={{
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontSize: '14px',
                  fontWeight: 600,
                  borderColor: '#6b7280',
                  color: '#6b7280',
                  '&:hover': {
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    borderColor: '#6b7280',
                  },
                }}
                startIcon={<Clear />}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          💡 <strong>Tip:</strong> These filters work instantly on your current search results
        </Typography>
      </Box>
    </Fade>
  );
}