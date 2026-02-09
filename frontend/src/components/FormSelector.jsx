import React, { useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import { getForms } from '../services/api';

const FormSelector = ({ onSelect }) => {
    const [forms, setForms] = useState([]);
    const [selectedFormId, setSelectedFormId] = useState('');

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const data = await getForms();
                setForms(data);
            } catch (error) {
                console.error('Error fetching forms:', error);
            }
        };
        fetchForms();
    }, []);

    const handleChange = (event) => {
        const formId = event.target.value;
        setSelectedFormId(formId);
        onSelect(formId);
    };

    return (
        <Box sx={{ minWidth: 200 }}>
            <Typography variant="h6" gutterBottom>Select Form</Typography>
            <FormControl fullWidth>
                <InputLabel id="form-select-label">Form</InputLabel>
                <Select
                    labelId="form-select-label"
                    id="form-select"
                    value={selectedFormId}
                    label="Form"
                    onChange={handleChange}
                >
                    {forms.map((form) => (
                        <MenuItem key={form.id} value={form.id}>
                            {form.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default FormSelector;
