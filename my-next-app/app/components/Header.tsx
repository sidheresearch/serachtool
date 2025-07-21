import { Box, Typography } from '@mui/material';

export function Header() {
  return (
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
  );
}