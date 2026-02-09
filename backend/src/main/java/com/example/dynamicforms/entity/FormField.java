package com.example.dynamicforms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class FormField {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String label;
    private String name;
    private String type; // TEXT, NUMBER, SELECT
    private boolean required;
    private String options; // Comma separated values for SELECT type
    private boolean searchable;
    private boolean hiddenInGrid;

    private Integer formOrder;
    private Integer gridOrder;
    private String validationRule;

    @ManyToOne
    @JoinColumn(name = "form_config_id")
    @JsonIgnore
    private FormConfig formConfig;
}
