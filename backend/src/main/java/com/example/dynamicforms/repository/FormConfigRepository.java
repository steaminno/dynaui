package com.example.dynamicforms.repository;

import com.example.dynamicforms.entity.FormConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FormConfigRepository extends JpaRepository<FormConfig, Long> {
}
