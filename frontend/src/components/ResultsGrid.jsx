import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

const ResultsGrid = ({ rows, columns, rowCount, paginationModel, onPaginationModelChange }) => {
    if (!columns || columns.length === 0) {
        return null;
    }

    return (
        <Box sx={{ width: '100%', mt: 0 }}>
            <Typography variant="h6" gutterBottom>Results</Typography>
            <DataGrid
                rows={rows}
                columns={columns}
                rowCount={rowCount}
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={onPaginationModelChange}
                pageSizeOptions={[5, 10, 20]}
                checkboxSelection
                density="compact"
                disableRowSelectionOnClick
                sx={{ border: 'none' }}
            />
        </Box>
    );
};

export default ResultsGrid;
