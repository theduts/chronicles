package com.chronicles;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class ChroniclesApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChroniclesApplication.class, args);
    }

}
