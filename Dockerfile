FROM mcr.microsoft.com/dotnet/sdk:6.0 AS serverbuild
WORKDIR /src
# 'server' is my Server Folder
COPY server /src
RUN dotnet publish -c Release -o release 

FROM node:16.13.1-alpine AS clientbuild
WORKDIR /src
# 'client' is my Client Folder
COPY client /src
RUN npm install
RUN npm run build

FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=serverbuild /src/release /app
COPY --from=clientbuild /src/build /app/wwwroot
# 'caraokedb' is my Database
# https://stackoverflow.com/questions/48669548/why-does-aspnet-core-start-on-port-80-from-within-docker
# ENV DB_CONNECTION_STRING=""
# ENV ASPNETCORE_URLS="http://*:5000"
# ENV ADMIN_API_KEY=""
CMD ["/app/server"]