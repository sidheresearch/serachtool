import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Fade
} from '@mui/material';
import { TopImportersResponse } from '../utils/api';
import { ImporterChart } from './ImporterChart';

interface TopImportersSectionProps {
  showTopImporters: boolean;
  topImporters: TopImportersResponse | null;
}

export function TopImportersSection({
  showTopImporters,
  topImporters
}: TopImportersSectionProps) {
  if (!showTopImporters || !topImporters) return null;

  return (
    <Fade in={showTopImporters} timeout={800}>
      <Box sx={{ mt: 4 }}>
        {/* Chart Section */}
        {topImporters.data.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <ImporterChart 
              data={topImporters.data} 
              products_searched={topImporters.products_searched} 
            />
          </Box>
        )}

        {/* Table Section */}
        <Paper
          elevation={8}
          sx={{ 
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, rgba(251, 191, 36, 0.03) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.1)',
            overflow: 'hidden'
          }}
        >
          {/* Top Importers Header */}
          <Box sx={{ p: 4, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                📊 Top Importers Details
              </Typography>
              <Chip 
                label={`${topImporters.count} importers found`}
                variant="outlined"
                sx={{ 
                  fontWeight: 600,
                  borderColor: '#f59e0b',
                  color: '#f59e0b',
                  fontSize: '14px'
                }}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Top importers by total value for: {topImporters.products_searched?.join(', ')}
            </Typography>
          </Box>
          
          {/* Top Importers Table */}
          {topImporters.data.length > 0 ? (
            <TableContainer sx={{ maxHeight: '500px' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderBottom: '2px solid rgba(245, 158, 11, 0.1)', minWidth: 50 }}>
                      RANK
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderBottom: '2px solid rgba(245, 158, 11, 0.1)', minWidth: 200 }}>
                      IMPORTER NAME
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderBottom: '2px solid rgba(245, 158, 11, 0.1)', minWidth: 120 }}>
                      IMPORTER ID
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderBottom: '2px solid rgba(245, 158, 11, 0.1)', minWidth: 100 }}>
                      CITY
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderBottom: '2px solid rgba(245, 158, 11, 0.1)', minWidth: 140 }}>
                      TOTAL VALUE (USD)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderBottom: '2px solid rgba(245, 158, 11, 0.1)', minWidth: 100 }}>
                      SHIPMENTS
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderBottom: '2px solid rgba(245, 158, 11, 0.1)', minWidth: 120 }}>
                      TOTAL QUANTITY
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderBottom: '2px solid rgba(245, 158, 11, 0.1)', minWidth: 120 }}>
                      AVG UNIT PRICE
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderBottom: '2px solid rgba(245, 158, 11, 0.1)', minWidth: 110 }}>
                      FIRST IMPORT
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderBottom: '2px solid rgba(245, 158, 11, 0.1)', minWidth: 110 }}>
                      LAST IMPORT
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderBottom: '2px solid rgba(245, 158, 11, 0.1)', minWidth: 100 }}>
                      HS CODES
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.05)', borderBottom: '2px solid rgba(245, 158, 11, 0.1)', minWidth: 100 }}>
                      COUNTRIES
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topImporters.data.map((importer, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'rgba(245, 158, 11, 0.02)' 
                        },
                        '&:nth-of-type(even)': {
                          backgroundColor: 'rgba(0, 0, 0, 0.01)'
                        }
                      }}
                    >
                      <TableCell sx={{ fontSize: '13px', fontWeight: 600 }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', maxWidth: 200 }}>
                        <Box
                          title={importer.importer_name || '-'}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {importer.importer_name && importer.importer_name.length > 25
                            ? `${importer.importer_name.substring(0, 25)}...`
                            : importer.importer_name || '-'
                          }
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', fontFamily: 'monospace' }}>
                        {importer.importer_id || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>
                        {importer.city || '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>
                        {importer.total_value_usd ? `$${Number(importer.total_value_usd).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', textAlign: 'right' }}>
                        {importer.total_shipments ? Number(importer.total_shipments).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', textAlign: 'right' }}>
                        {importer.total_quantity ? Number(importer.total_quantity).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', textAlign: 'right' }}>
                        {importer.avg_unit_price_usd ? `$${Number(importer.avg_unit_price_usd).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>
                        {importer.first_import_date ? new Date(importer.first_import_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>
                        {importer.last_import_date ? new Date(importer.last_import_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>
                        <Chip
                          label={importer.unique_hs_codes || 0}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: '#f59e0b',
                            color: '#f59e0b',
                            fontSize: '12px'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>
                        <Chip
                          label={importer.unique_countries || 0}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: '#10b981',
                            color: '#10b981',
                            fontSize: '12px'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 8,
                px: 4
              }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No importers found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Fade>
  );
}