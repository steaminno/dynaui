package com.example.dynamicforms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DynamicFormsApplication {

    public static void main(String[] args) {
        SpringApplication.run(DynamicFormsApplication.class, args);
    }

    @Bean
    public CommandLineRunner syncTables(com.example.dynamicforms.service.FormService formService) {
        return args -> {
            formService.syncAllTables();
            System.out.println("Synced physical tables with form configurations.");
        };
    }
}
