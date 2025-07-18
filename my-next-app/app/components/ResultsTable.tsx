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
  Button,
  Pagination,
  Fade,
  Divider
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { SearchResponse } from '../utils/api';

interface ResultsTableProps {
  hasData: boolean;
  searchResults: SearchResponse | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

export function ResultsTable({
  hasData,
  searchResults,
  currentPage,
  setCurrentPage,
  itemsPerPage
}: ResultsTableProps) {
  if (!hasData || !searchResults) return null;

  const totalPages = Math.ceil(searchResults.data.length / itemsPerPage);
  const paginatedData = searchResults.data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
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
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 100 }}>
                        SYSTEM ID
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 110 }}>
                        REG DATE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 100 }}>
                        MONTH YEAR
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 100 }}>
                        HS CODE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 80 }}>
                        CHAPTER
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 200 }}>
                        PRODUCT NAME
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 200 }}>
                        UNIQUE PRODUCT NAME
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 100 }}>
                        QUANTITY
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 80 }}>
                        UNIT
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 120 }}>
                        UNIT PRICE (USD)
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 140 }}>
                        TOTAL VALUE (USD)
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 120 }}>
                        IMPORTER ID
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 200 }}>
                        IMPORTER NAME
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 120 }}>
                        CITY
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 150 }}>
                        CHA NUMBER
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 150 }}>
                        TYPE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 200 }}>
                        SUPPLIER NAME
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 250 }}>
                        SUPPLIER ADDRESS
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 120 }}>
                        INDIAN PORT
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 120 }}>
                        FOREIGN PORT
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 120 }}>
                        ORIGIN COUNTRY
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 120 }}>
                        EXCHANGE RATE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 100 }}>
                        DUTY
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, backgroundColor: 'rgba(102, 126, 234, 0.05)', borderBottom: '2px solid rgba(102, 126, 234, 0.1)', minWidth: 100 }}>
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
                        <TableCell sx={{ fontSize: '13px', fontFamily: 'monospace' }}>
                          {row.system_id || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px' }}>
                          {row.reg_date ? new Date(row.reg_date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px' }}>
                          {row.month_year || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', fontFamily: 'monospace' }}>
                          {row.hs_code || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px' }}>
                          {row.chapter || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', maxWidth: 200 }}>
                          <Box 
                            title={row.product_name || '-'}
                            sx={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}
                          >
                            {row.product_name && row.product_name.length > 30 
                              ? `${row.product_name.substring(0, 30)}...` 
                              : row.product_name || '-'
                            }
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', maxWidth: 200 }}>
                          <Box 
                            title={row.unique_product_name || '-'}
                            sx={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}
                          >
                            {row.unique_product_name && row.unique_product_name.length > 30 
                              ? `${row.unique_product_name.substring(0, 30)}...` 
                              : row.unique_product_name || '-'
                            }
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', textAlign: 'right' }}>
                          {row.quantity ? Number(row.quantity).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px' }}>
                          {row.unit_quantity || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', textAlign: 'right' }}>
                          {row.unit_price_usd ? `$${Number(row.unit_price_usd).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>
                          {row.total_value_usd ? `$${Number(row.total_value_usd).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', fontFamily: 'monospace' }}>
                          {row.importer_id || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', maxWidth: 200 }}>
                          <Box 
                            title={row.true_importer_name || '-'}
                            sx={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}
                          >
                            {row.true_importer_name && row.true_importer_name.length > 25 
                              ? `${row.true_importer_name.substring(0, 25)}...` 
                              : row.true_importer_name || '-'
                            }
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px' }}>
                          {row.city || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', maxWidth: 150 }}>
                          <Box 
                            title={row.cha_number || '-'}
                            sx={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}
                          >
                            {row.cha_number && row.cha_number.length > 20 
                              ? `${row.cha_number.substring(0, 20)}...` 
                              : row.cha_number || '-'
                            }
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', maxWidth: 150 }}>
                          <Box 
                            title={row.type || '-'}
                            sx={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}
                          >
                            {row.type && row.type.length > 20 
                              ? `${row.type.substring(0, 20)}...` 
                              : row.type || '-'
                            }
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', maxWidth: 200 }}>
                          <Box 
                            title={row.true_supplier_name || '-'}
                            sx={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}
                          >
                            {row.true_supplier_name && row.true_supplier_name.length > 25 
                              ? `${row.true_supplier_name.substring(0, 25)}...` 
                              : row.true_supplier_name || '-'
                            }
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', maxWidth: 250 }}>
                          <Box 
                            title={row.supplier_address || '-'}
                            sx={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap' 
                            }}
                          >
                            {row.supplier_address && row.supplier_address.length > 30 
                              ? `${row.supplier_address.substring(0, 30)}...` 
                              : row.supplier_address || '-'
                            }
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px' }}>
                          {row.indian_port || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px' }}>
                          {row.foreign_port || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px' }}>
                          {row.origin_country || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', textAlign: 'right' }}>
                          {row.exchange_rate_usd ? Number(row.exchange_rate_usd).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '13px', textAlign: 'right' }}>
                          {row.duty ? Number(row.duty).toLocaleString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => {
                              console.log('View details:', row);
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
  );
}