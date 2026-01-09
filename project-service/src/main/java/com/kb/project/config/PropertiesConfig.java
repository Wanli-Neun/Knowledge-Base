package com.kb.project.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import com.kb.project.storage.S3Properties;

@Configuration
@EnableConfigurationProperties(S3Properties.class)
public class PropertiesConfig {}
