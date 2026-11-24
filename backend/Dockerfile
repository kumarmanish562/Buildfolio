# syntax=docker/dockerfile:1.4
# Multi-stage Dockerfile for Buildfolio Spring Boot Backend (Java 21)

# Stage 1: Build stage
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace

# Cache Maven dependencies
COPY backend/.mvn/ .mvn/
COPY backend/mvnw backend/pom.xml ./
RUN chmod +x ./mvnw && ./mvnw dependency:go-offline -B

# Copy source and build jar
COPY backend/src/ ./src/
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre-jammy AS runner
WORKDIR /app

# Run as non-root user for security
RUN groupadd -r buildfolio && useradd -r -g buildfolio buildfolio

COPY --from=builder /workspace/target/*.jar app.jar
RUN chown -R buildfolio:buildfolio /app

USER buildfolio

EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
