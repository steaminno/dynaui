package com.example.dynamicforms.controller;

import com.example.dynamicforms.entity.FormConfig;
import com.example.dynamicforms.service.FormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forms")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }) // Allow React app to access
public class FormController {

    @Autowired
    private FormService formService;

    @GetMapping
    public List<FormConfig> getAllForms() {
        return formService.getAllForms();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormConfig> getFormById(@PathVariable Long id) {
        return formService.getFormById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createForm(@RequestBody FormConfig formConfig) {
        try {
            FormConfig savedForm = formService.saveForm(formConfig);
            return ResponseEntity.ok(savedForm);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating form: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormConfig> updateForm(@PathVariable Long id, @RequestBody FormConfig formConfig) {
        return formService.getFormById(id)
                .map(existingForm -> {
                    formConfig.setId(id);
                    return ResponseEntity.ok(formService.saveForm(formConfig));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable Long id) {
        formService.deleteForm(id);
        return ResponseEntity.ok().build();
    }

    @Autowired
    private com.example.dynamicforms.service.DynamicTableService dynamicTableService;

    @GetMapping("/{id}/data")
    public ResponseEntity<?> getFormData(
            @PathVariable Long id,
            @RequestParam(required = false) java.util.Map<String, String> filters,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return formService.getFormById(id)
                .map(form -> {
                    java.util.Map<String, Object> searchFilters = new java.util.HashMap<>();
                    if (filters != null) {
                        searchFilters.putAll(filters);
                        // Remove pagination params from filters map
                        searchFilters.remove("page");
                        searchFilters.remove("size");
                    }

                    int offset = page * size;
                    List<java.util.Map<String, Object>> rawData = dynamicTableService.searchTable(form.getTableName(),
                            searchFilters, size, offset);
                    long totalElements = dynamicTableService.countTable(form.getTableName(), searchFilters);

                    // Transform raw data (uppercase keys) to match FormField names (camelCase)
                    List<java.util.Map<String, Object>> transformedData = rawData.stream().map(row -> {
                        java.util.Map<String, Object> newRow = new java.util.HashMap<>();
                        // Handle ID specially (ensure lowercase 'id')
                        if (row.containsKey("ID")) {
                            newRow.put("id", row.get("ID"));
                        }

                        // Map other fields
                        form.getFields().forEach(field -> {
                            String dbColName = field.getName().toUpperCase();
                            if (row.containsKey(dbColName)) {
                                newRow.put(field.getName(), row.get(dbColName));
                            }
                        });
                        return newRow;
                    }).collect(java.util.stream.Collectors.toList());

                    java.util.Map<String, Object> response = new java.util.HashMap<>();
                    response.put("content", transformedData);
                    response.put("totalElements", totalElements);
                    response.put("page", page);
                    response.put("size", size);

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/data")
    public ResponseEntity<Void> submitFormData(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> data) {

        return formService.getFormById(id)
                .map(form -> {
                    dynamicTableService.insertData(form.getTableName(), data);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
