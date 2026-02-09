package com.example.dynamicforms.service;

import com.example.dynamicforms.entity.FormConfig;
import com.example.dynamicforms.repository.FormConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FormService {

    @Autowired
    private FormConfigRepository formConfigRepository;

    public List<FormConfig> getAllForms() {
        return formConfigRepository.findAll();
    }

    public Optional<FormConfig> getFormById(Long id) {
        return formConfigRepository.findById(id);
    }

    @Autowired
    private DynamicTableService dynamicTableService;

    public FormConfig saveForm(FormConfig formConfig) {
        // Ensure relationships are set correctly
        if (formConfig.getFields() != null) {
            formConfig.getFields().forEach(field -> field.setFormConfig(formConfig));
        }

        FormConfig saved = formConfigRepository.save(formConfig);

        // Create physical table
        dynamicTableService.createTable(saved);

        return saved;
    }

    @org.springframework.transaction.annotation.Transactional
    public void syncAllTables() {
        List<FormConfig> configs = formConfigRepository.findAll();
        configs.forEach(dynamicTableService::createTable);
    }

    public void deleteForm(Long id) {
        formConfigRepository.findById(id).ifPresent(formConfig -> {
            dynamicTableService.dropTable(formConfig.getTableName());
            formConfigRepository.deleteById(id);
        });
    }
}
