FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY . .

# Dar permisos de ejecución al wrapper de Maven
RUN chmod +x mvnw

# Compilar la app
RUN ./mvnw clean package -DskipTests

EXPOSE 8080

CMD ["java", "-jar", "target/reservas-0.0.1-SNAPSHOT.jar"]
