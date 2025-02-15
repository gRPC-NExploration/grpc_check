FROM mcr.microsoft.com/dotnet/runtime:8.0 AS base
USER $APP_UID
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ./src/front/FileManagerCliClient .
COPY ./Protos/App ./FileManagerCliClient/Protos
RUN dotnet restore ./FileManagerCliClient/FileManagerCliClient.csproj
RUN dotnet build ./FileManagerCliClient/FileManagerCliClient.csproj -c $BUILD_CONFIGURATION -o /app/build /p:BuildFromDocker=true

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish ./FileManagerCliClient/FileManagerCliClient.csproj -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false /p:BuildFromDocker=true

FROM base AS final
ARG GrpcServerUrl
ENV Servers__GrpcServerUri=$GrpcServerUrl
WORKDIR /app
COPY --from=publish /app/publish .

ENTRYPOINT ["/bin/sh", "-c"]

CMD ["dotnet FileManagerCliClient.dll --help && sleep infinity"]