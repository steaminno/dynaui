import React, { useEffect, useState } from 'react';
import { TextField, Button, Box, Typography, MenuItem, Select, FormControl, InputLabel, Grid, Switch, FormControlLabel, Checkbox } from '@mui/material';
import { getFormById, submitForm } from '../services/api';
import { useNotification } from '../context/NotificationContext';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const DynamicForm = ({ formId, onSubmit, isDataEntry = false, compact = false }) => {
    const { showNotification } = useNotification();
    const [formConfig, setFormConfig] = useState(null);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (formId) {
            const fetchForm = async () => {
                try {
                    const data = await getFormById(formId);
                    // Sort fields by formOrder (default to 0 if null)
                    if (data.fields) {
                        data.fields.sort((a, b) => (a.formOrder || 0) - (b.formOrder || 0));
                    }
                    setFormConfig(data);
                    // Reset form data when form changes
                    setFormData({});
                    setErrors({});
                } catch (error) {
                    console.error('Error fetching form config:', error);
                }
            };
            fetchForm();
        } else {
            setFormConfig(null);
        }
    }, [formId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear error when user types
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: null,
            });
        }
    };

    const handleDateChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value ? value.format('YYYY-MM-DD') : '',
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const validate = () => {
        let tempErrors = {};
        let isValid = true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        formConfig.fields.forEach(field => {
            if (field.required && !formData[field.name] && field.type !== 'BOOLEAN') {
                tempErrors[field.name] = 'This field is required';
                isValid = false;
            }
            if (field.type === 'NUMBER' && formData[field.name] && isNaN(formData[field.name])) {
                tempErrors[field.name] = 'Must be a number';
                isValid = false;
            }
            if (field.type === 'EMAIL' && formData[field.name] && !emailRegex.test(formData[field.name])) {
                tempErrors[field.name] = 'Invalid email address';
                isValid = false;
            }
        });
        setErrors(tempErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            if (onSubmit) {
                onSubmit(formData);
            } else {
                try {
                    await submitForm(formId, formData);
                    showNotification('Form submitted successfully!', 'success');
                    setFormData({});
                } catch (error) {
                    showNotification('Error submitting form', 'error');
                }
            }
        }
    };

    if (!formConfig) return null;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: isDataEntry ? 2 : 0 }}>
                {!compact && <Typography variant="h5" gutterBottom>{formConfig.name}</Typography>}
                <Grid container spacing={compact ? 1 : 2} alignItems="center">
                    {formConfig.fields
                        .filter(f => isDataEntry ? true : f.searchable)
                        .map((field) => (
                            <Grid item xs={12} sm={compact ? 12 : 6} md={compact ? 12 : 4} key={field.id}>
                                {field.type === 'SELECT' ? (
                                    <FormControl fullWidth size="small" required={field.required && isDataEntry}>
                                        <InputLabel id={`${field.name} -label`}>{field.label}</InputLabel>
                                        <Select
                                            labelId={`${field.name} -label`}
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            label={field.label}
                                            onChange={handleChange}
                                        >
                                            {field.options && field.options.split(',').map(option => (
                                                <MenuItem key={option} value={option}>{option}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : field.type === 'DATE' ? (
                                    <DatePicker
                                        label={field.label}
                                        value={formData[field.name] ? dayjs(formData[field.name]) : null}
                                        onChange={(newValue) => handleDateChange(field.name, newValue)}
                                        maxDate={field.validationRule === 'PAST_ONLY' ? dayjs() : undefined}
                                        minDate={field.validationRule === 'FUTURE_ONLY' ? dayjs() : undefined}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                fullWidth: true,
                                                required: field.required && isDataEntry,
                                                helperText: field.validationRule ? (field.validationRule === 'PAST_ONLY' ? 'Past dates only' : 'Future dates only') : ''
                                            }
                                        }}
                                    />
                                ) : field.type === 'BOOLEAN' ? (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={!!formData[field.name]}
                                                onChange={(e) => handleChange({ target: { name: field.name, value: e.target.checked } })}
                                                name={field.name}
                                            />
                                        }
                                        label={field.label}
                                    />
                                ) : (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label={field.label}
                                        name={field.name}
                                        type={field.type === 'NUMBER' ? 'number' : (field.type === 'EMAIL' ? 'email' : 'text')}
                                        multiline={field.type === 'TEXTAREA'}
                                        rows={field.type === 'TEXTAREA' ? 4 : 1}
                                        value={formData[field.name] || ''}
                                        onChange={handleChange}
                                        required={field.required && isDataEntry}
                                        error={!!errors[field.name]}
                                        helperText={errors[field.name]}
                                    />
                                )}
                            </Grid>
                        ))}
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent={compact ? "flex-end" : "flex-start"}>
                            <Button type="submit" variant="contained" color="primary" fullWidth={compact}>
                                {isDataEntry ? 'Save Record' : 'Search'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
};

export default DynamicForm;
