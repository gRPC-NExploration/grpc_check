FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ./src/back/App .
COPY ./Protos/App ./App/Protos/App
COPY ./Protos/Common ./App/Protos/Common
RUN dotnet restore "./App/App.csproj"
RUN dotnet build "./App/App.csproj" -c $BUILD_CONFIGURATION -o /app/build /p:BuildFromDocker=true

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./App/App.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false /p:BuildFromDocker=true

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "App.dll"]