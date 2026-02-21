# ---------- Build stage ----------
FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /app

# Copy everything
COPY . .

# Build the jar
RUN ./mvnw clean package -DskipTests

# ---------- Runtime stage ----------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy jar from builder
COPY --from=builder /app/target/Cavista-0.0.1-SNAPSHOT.jar app.jar

# Render provides PORT env
EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]