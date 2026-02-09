package com.example.dynamicforms.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
public class FormConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String tableName;

    @OneToMany(mappedBy = "formConfig", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormField> fields;
}
