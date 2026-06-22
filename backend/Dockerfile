# Use an official Maven image to build Spring Boot app
FROM maven:3.9-eclipse-temurin-21 AS build

# Set the working directory
WORKDIR /app

# Copy the pom.xml and install dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and build the application
COPY src ./src
RUN mvn clean package -DskipTests -B

# Use an official OpenJDK image to ruun the application
FROM eclipse-temurin:21-jre-jammy

# Set the working directory
WORKDIR /app

# Copy the built JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Run as a non-root user, owning /app so it can write to ./uploads
RUN useradd --system --no-create-home appuser && \
    mkdir -p /app/uploads && \
    chown -R appuser:appuser /app
USER appuser

# Expose port 8080
EXPOSE 8080

#Specify the command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
