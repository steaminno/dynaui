import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Paper, Grid, IconButton, MenuItem, Divider, FormControlLabel, Checkbox } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const FormEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const isEditMode = !!id;

    const [formConfig, setFormConfig] = useState({
        name: '',
        tableName: '',
        fields: []
    });

    useEffect(() => {
        if (isEditMode) {
            fetchForm();
        }
    }, [id]);

    const fetchForm = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/forms/${id}`);
            setFormConfig(response.data);
        } catch (error) {
            console.error('Error fetching form:', error);
            showNotification('Error fetching form details', 'error');
        }
    };

    const handleFormNameChange = (e) => {
        const name = e.target.value;
        // Auto-generate table name if it's empty or matching the previous name slug
        // and we are NOT in edit mode (to avoid accidental renames of existing tables)
        if (!isEditMode) {
            const tableName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            setFormConfig({ ...formConfig, name, tableName });
        } else {
            setFormConfig({ ...formConfig, name });
        }
    };

    const handleTableNameChange = (e) => {
        setFormConfig({ ...formConfig, tableName: e.target.value });
    };

    // --- Fields Management ---
    const addField = () => {
        setFormConfig({
            ...formConfig,
            fields: [...formConfig.fields, {
                label: '',
                name: '',
                type: 'TEXT',
                required: false,
                formOrder: 0,
                gridOrder: 0,
                validationRule: '',
                options: '',
                searchable: true,
                hiddenInGrid: false
            }]
        });
    };

    const updateField = (index, field, value) => {
        const newFields = [...formConfig.fields];
        newFields[index][field] = value;
        setFormConfig({ ...formConfig, fields: newFields });
    };

    const removeField = (index) => {
        const newFields = formConfig.fields.filter((_, i) => i !== index);
        setFormConfig({ ...formConfig, fields: newFields });
    };

    const validateForm = () => {
        const nameRegex = /^[a-zA-Z0-9_]+$/;
        if (!nameRegex.test(formConfig.tableName)) {
            showNotification('Table Name must contain only letters, numbers, and underscores.', 'error');
            return false;
        }
        for (const field of formConfig.fields) {
            if (!nameRegex.test(field.name)) {
                showNotification(`Column Name "${field.name}" is invalid. Use only letters, numbers, and underscores.`, 'error');
                return false;
            }
        }
        return true;
    };

    // --- Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            if (isEditMode) {
                await axios.put(`http://localhost:8080/api/forms/${id}`, formConfig);
            } else {
                await axios.post('http://localhost:8080/api/forms', formConfig);
            }
            showNotification('Form saved successfully!', 'success');
            navigate('/admin');
        } catch (error) {
            console.error('Error saving form:', error);
            const msg = error.response?.data || error.message;
            showNotification(`Error saving form: ${msg}`, 'error');
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>{isEditMode ? 'Edit Table Schema' : 'Define New Data Table'}</Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Step 1: Table Identity</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Form Title (Display Name)"
                                value={formConfig.name}
                                onChange={handleFormNameChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Table Name (SQL)"
                                value={formConfig.tableName}
                                onChange={handleTableNameChange}
                                required
                                helperText="Physical table name in database (letters, numbers, _)"
                                disabled={isEditMode} // Disable table name edit in edit mode to prevent issues
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Table Columns</Typography>
                        <Button startIcon={<AddIcon />} onClick={addField} variant="contained" size="small">Add Column</Button>
                    </Box>

                    {/* Table Header */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 2.5fr 0.5fr', gap: 1, px: 2, py: 1, bgcolor: '#f5f5f5', borderRadius: 1, fontWeight: 'bold' }}>
                        <Typography variant="subtitle2">Display Label</Typography>
                        <Typography variant="subtitle2">SQL Column</Typography>
                        <Typography variant="subtitle2">Type</Typography>
                        <Typography variant="subtitle2" title="Form Order">F. Ord</Typography>
                        <Typography variant="subtitle2" title="Grid Order">G. Ord</Typography>
                        <Typography variant="subtitle2">Settings</Typography>
                        <Box></Box>
                    </Box>

                    {/* Field Rows */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {formConfig.fields.map((field, index) => (
                            <Paper key={index} elevation={0} sx={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 2.5fr 0.5fr', gap: 1, alignItems: 'start', p: 1, border: '1px solid #eee' }}>
                                <TextField
                                    fullWidth size="small" placeholder="Label"
                                    value={field.label} onChange={(e) => updateField(index, 'label', e.target.value)}
                                    required hiddenLabel
                                />
                                <TextField
                                    fullWidth size="small" placeholder="Column Name"
                                    value={field.name} onChange={(e) => updateField(index, 'name', e.target.value)}
                                    required hiddenLabel
                                    error={!/^[a-zA-Z0-9_]*$/.test(field.name)}
                                />
                                <Box>
                                    <TextField select fullWidth size="small" value={field.type} onChange={(e) => updateField(index, 'type', e.target.value)} hiddenLabel>
                                        <MenuItem value="TEXT">Text</MenuItem>
                                        <MenuItem value="NUMBER">Number</MenuItem>
                                        <MenuItem value="DATE">Date</MenuItem>
                                        <MenuItem value="BOOLEAN">Yes/No</MenuItem>
                                        <MenuItem value="EMAIL">Email</MenuItem>
                                        <MenuItem value="TEXTAREA">Text Area</MenuItem>
                                        <MenuItem value="SELECT">Select</MenuItem>
                                    </TextField>
                                    {field.type === 'SELECT' && (
                                        <TextField
                                            fullWidth size="small" placeholder="Opt1,Opt2"
                                            value={field.options || ''} onChange={(e) => updateField(index, 'options', e.target.value)}
                                            sx={{ mt: 0.5 }}
                                        />
                                    )}
                                    {field.type === 'DATE' && (
                                        <TextField
                                            select fullWidth size="small" placeholder="Validation"
                                            value={field.validationRule || ''}
                                            onChange={(e) => updateField(index, 'validationRule', e.target.value)}
                                            sx={{ mt: 0.5 }}
                                            SelectProps={{ displayEmpty: true }}
                                        >
                                            <MenuItem value=""><em>No Rule</em></MenuItem>
                                            <MenuItem value="PAST_ONLY">Past Only</MenuItem>
                                            <MenuItem value="FUTURE_ONLY">Future Only</MenuItem>
                                        </TextField>
                                    )}
                                </Box>
                                <TextField
                                    type="number" fullWidth size="small" placeholder="0"
                                    value={field.formOrder || 0} onChange={(e) => updateField(index, 'formOrder', parseInt(e.target.value))}
                                    hiddenLabel
                                />
                                <TextField
                                    type="number" fullWidth size="small" placeholder="0"
                                    value={field.gridOrder || 0} onChange={(e) => updateField(index, 'gridOrder', parseInt(e.target.value))}
                                    hiddenLabel
                                />
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    <FormControlLabel
                                        control={<Checkbox size="small" checked={field.required || false} onChange={(e) => updateField(index, 'required', e.target.checked)} sx={{ p: 0.5 }} />}
                                        label={<Typography variant="caption" sx={{ fontWeight: 'bold' }}>Required</Typography>}
                                        sx={{ mr: 1, ml: 0 }}
                                    />
                                    <FormControlLabel
                                        control={<Checkbox size="small" checked={field.searchable !== false} onChange={(e) => updateField(index, 'searchable', e.target.checked)} sx={{ p: 0.5 }} />}
                                        label={<Typography variant="caption">Srch</Typography>}
                                        sx={{ mr: 1, ml: 0 }}
                                    />
                                    <FormControlLabel
                                        control={<Checkbox size="small" checked={field.hiddenInGrid !== true} onChange={(e) => updateField(index, 'hiddenInGrid', !e.target.checked)} sx={{ p: 0.5 }} />}
                                        label={<Typography variant="caption">Grid</Typography>}
                                        sx={{ mr: 0, ml: 0 }}
                                    />
                                </Box>
                                <IconButton size="small" color="error" onClick={() => removeField(index)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Paper>
                        ))}
                    </Box>
                </Paper>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="primary" type="submit" size="large">Save Form</Button>
                </Box>
            </Box>
        </Container>
    );
};

export default FormEditor;
