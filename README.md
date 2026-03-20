[![SonarQube Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=projet43&metric=alert_status)](https://sonarcloud.io/dashboard?id=projet43)

# projet43

This project is a JHipster application.

## Introduction

This project is generated using [JHipster](https://www.jhipster.tech/), a development platform to quickly generate, develop, & deploy modern web applications & microservice architectures.

It's a full-stack application built with [Spring Boot](https://spring.io/projects/spring-boot) for the backend and [Angular](https://angular.io/) for the frontend.

## Prerequisites

Before you can build and run this project, you must install:

*   **Node.js**: We recommend using [nvm](https://github.com/nvm-sh/nvm) for managing Node.js versions.
    *   Node.js 18.x or higher
    *   npm (bundled with Node.js)
*   **Java**: A Java Development Kit (JDK) 17 or higher.
*   **Maven**: Apache Maven 3.x.x

## Development

To start your application in development mode:

### 1. Run the Spring Boot Backend

Open a terminal and run the Spring Boot application using Maven:

bash
./mvnw


The application will be available at `http://localhost:8080`.

### 2. Run the Angular Frontend

Open another terminal in the project root directory and run the Angular development server:

bash
npm start


The frontend development server will be available at `http://localhost:9000` with live-reload capabilities.

## Building for Production

To package the application for production:

bash
./mvnw package -Pprod -DskipTests


This will generate a `projet43-0.0.1-SNAPSHOT.jar` (or similar version) file in the `target/` directory. You can then run this JAR file:

bash
java -jar target/*.jar


## Testing

To run all unit and integration tests:

bash
./mvnw verify


To run only frontend tests (Karma/Jasmine):

bash
npm test


To run end-to-end tests (Protractor/Cypress - if configured):

bash
npm run e2e


## SonarQube Analysis

To perform a SonarQube analysis locally, ensure you have a SonarQube instance running (e.g., Docker `docker run -d --name sonarqube -p 9000:9000 sonarqube`) and your `sonar-project.properties` file is correctly configured.

Then execute the following command:

bash
./mvnw clean verify sonar:sonar


The analysis results will be visible on your SonarQube dashboard.

## Further Documentation

*   [JHipster Documentation](https://www.jhipster.tech/documentation-3.9.1/)
*   [Spring Boot Reference Guide](https://docs.spring.io/spring-boot/docs/current/reference/html/)
*   [Angular Documentation](https://angular.io/docs)