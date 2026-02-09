INSERT INTO form_config (id, name, table_name) VALUES (1, 'User Registration', 'user_registration');
INSERT INTO form_config (id, name, table_name) VALUES (2, 'Product Feedback', 'product_feedback');

-- User Registration Fields
INSERT INTO form_field (id, form_config_id, label, name, type, required, options, searchable, hidden_in_grid) VALUES (1, 1, 'Full Name', 'fullName', 'TEXT', true, null, true, false);
INSERT INTO form_field (id, form_config_id, label, name, type, required, options, searchable, hidden_in_grid) VALUES (2, 1, 'Age', 'age', 'NUMBER', true, null, true, false);
INSERT INTO form_field (id, form_config_id, label, name, type, required, options, searchable, hidden_in_grid) VALUES (3, 1, 'Role', 'role', 'SELECT', true, 'Admin,User,Guest', true, false);

-- Product Feedback Fields
INSERT INTO form_field (id, form_config_id, label, name, type, required, options, searchable, hidden_in_grid) VALUES (4, 2, 'Product Name', 'productName', 'TEXT', true, null, true, false);
INSERT INTO form_field (id, form_config_id, label, name, type, required, options, searchable, hidden_in_grid) VALUES (5, 2, 'Rating', 'rating', 'NUMBER', true, null, false, false);
INSERT INTO form_field (id, form_config_id, label, name, type, required, options, searchable, hidden_in_grid) VALUES (6, 2, 'Comments', 'comments', 'TEXT', false, null, false, false);

ALTER TABLE form_config ALTER COLUMN id RESTART WITH 3;
ALTER TABLE form_field ALTER COLUMN id RESTART WITH 7;
