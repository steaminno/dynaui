import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText, IconButton, Paper, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const AdminDashboard = () => {
    const [forms, setForms] = useState([]);

    const { showNotification } = useNotification();

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/forms');
            setForms(response.data);
        } catch (error) {
            console.error('Error fetching forms:', error);
            showNotification('Error fetching forms', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this form? This will permanently delete the table and all its data.')) {
            try {
                await axios.delete(`http://localhost:8080/api/forms/${id}`);
                showNotification('Form and table deleted successfully', 'success');
                fetchForms();
            } catch (error) {
                console.error('Error deleting form:', error);
                const msg = error.response?.data?.message || 'Error deleting form';
                showNotification(msg, 'error');
            }
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4">Data Table Management</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    component={RouterLink}
                    to="/admin/new"
                >
                    Define New Table
                </Button>
            </Box>
            <Paper elevation={3}>
                <List>
                    {forms.map((form) => (
                        <ListItem
                            key={form.id}
                            secondaryAction={
                                <Box>
                                    <IconButton edge="end" aria-label="edit" component={RouterLink} to={`/admin/edit/${form.id}`} sx={{ mr: 1 }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(form.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            }
                        >
                            <ListItemText
                                primary={form.name}
                                secondary={`ID: ${form.id}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Container>
    );
};

export default AdminDashboard;
