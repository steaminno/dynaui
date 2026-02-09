import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Typography, Box, Grid, Paper, CssBaseline, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import FormSelector from './components/FormSelector';
import DynamicForm from './components/DynamicForm';
import ResultsGrid from './components/ResultsGrid';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import FormEditor from './components/FormEditor';
import DataEntryPage from './pages/DataEntryPage';
import { getForms, getFormById, searchFormData } from './services/api';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

const Home = () => {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [columns, setColumns] = useState([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [currentFilters, setCurrentFilters] = useState({});

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const fetchedForms = await getForms();
        setForms(fetchedForms);
        if (fetchedForms.length > 0) {
          setSelectedFormId(fetchedForms[0].id);
        }
      } catch (error) {
        console.error("Error fetching forms:", error);
      }
    };
    fetchForms();
  }, []);

  useEffect(() => {
    if (selectedFormId) {
      handleSearch(currentFilters, paginationModel.page, paginationModel.pageSize);
    }
  }, [paginationModel, selectedFormId]);

  const handleFormSelect = async (formId) => {
    setSelectedFormId(formId);
    setRows([]);
    setTotalRows(0);
    setPaginationModel({ page: 0, pageSize: 5 });
    setCurrentFilters({});

    try {
      const config = await getFormById(formId);
      if (config.fields) {
        const gridCols = config.fields
          .filter(f => !f.hiddenInGrid)
          .sort((a, b) => (a.gridOrder || 0) - (b.gridOrder || 0))
          .map(f => ({
            field: f.name,
            headerName: f.label,
            width: 150
          }));
        setColumns(gridCols);
      } else {
        setColumns([]);
      }
    } catch (error) {
      console.error("Error fetching form config for columns", error);
      setColumns([]);
    }
  };

  const handleSearch = async (formData, page = 0, size = 5) => {
    setCurrentFilters(formData); // Store filters for pagination
    try {
      const response = await searchFormData(selectedFormId, formData, page, size);
      // Handle both legacy (list) and new (paged) responses during migration
      if (Array.isArray(response)) {
        setRows(response);
        setTotalRows(response.length);
      } else {
        setRows(response.content);
        setTotalRows(response.totalElements);
      }
    } catch (error) {
      console.error("Error searching data", error);
      setRows([]);
      setTotalRows(0);
    }
  };

  const handlePaginationModelChange = (newModel) => {
    setPaginationModel(newModel);
  };


  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 2 }}>
      <Grid container spacing={1}>
        <Grid item xs={12} md={2}> {/* Narrower sidebar */}
          <Paper elevation={0} sx={{ p: 1, border: '1px solid #e0e0e0', height: '100%', bgcolor: '#fafafa' }}>
            <FormSelector
              forms={forms}
              selectedFormId={selectedFormId}
              onSelect={handleFormSelect}
            />
          </Paper>
        </Grid>

        {selectedFormId && (
          <Grid item xs={12} md={10}> {/* Wider content area */}
            {/* Header & Actions */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} px={1}>
              <Typography variant="h6" color="textPrimary" fontWeight="600">{forms.find(f => f.id === selectedFormId)?.name}</Typography>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to={`/forms/${selectedFormId}/submit`}
                startIcon={<AddIcon />}
              >
                Add Data
              </Button>
            </Box>

            {/* Collapsible Search Filters */}
            <Paper elevation={0} sx={{ p: 1, mb: 1, border: '1px solid #e0e0e0' }}>
              <DynamicForm formId={selectedFormId} onSubmit={handleSearch} compact={true} />
            </Paper>

            {/* Results Grid */}
            <Paper elevation={0} sx={{ p: 0, border: '1px solid #e0e0e0' }}>
              <ResultsGrid
                rows={rows}
                columns={columns}
                rowCount={totalRows}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationModelChange}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};



const App = () => {
  return (
    <NotificationProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <CssBaseline />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/forms/:id/submit" element={<DataEntryPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/new" element={<FormEditor />} />
            <Route path="/admin/edit/:id" element={<FormEditor />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </NotificationProvider>
  );
};

export default App;
