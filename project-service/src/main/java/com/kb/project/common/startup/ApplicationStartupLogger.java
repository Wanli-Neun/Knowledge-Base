package com.kb.project.common.startup;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.core.env.Environment;

import lombok.RequiredArgsConstructor;


import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationStartupLogger implements ApplicationRunner {

    private final Environment env;

    @Override
    public void run(ApplicationArguments args) {
        String appName = env.getProperty("spring.application.name", "unknown-app");
        String port = env.getProperty("server.port", "8080");
        String[] profiles = env.getActiveProfiles();

        log.info("==============================================");
        log.info("Application started successfully");
        log.info("App Name      : {}", appName);
        log.info("Active Profile: {}", profiles.length > 0 ? String.join(", ", profiles) : "default");
        log.info("Server Port   : {}", port);
        log.info("Base URL      : http://localhost:{}/", port);
        log.info("==============================================");
    }

}
