import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DynamicForm from '../components/DynamicForm';
import { submitForm } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const DataEntryPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleSubmit = async (formData) => {
        try {
            await submitForm(id, formData);
            showNotification('Data submitted successfully!', 'success');
            navigate('/');
        } catch (error) {
            showNotification('Failed to submit data', 'error');
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/')}
                sx={{ mb: 2 }}
            >
                Back to Dashboard
            </Button>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>Add New Record</Typography>
                <DynamicForm formId={id} onSubmit={handleSubmit} isDataEntry={true} />
            </Paper>
        </Container>
    );
};

export default DataEntryPage;
