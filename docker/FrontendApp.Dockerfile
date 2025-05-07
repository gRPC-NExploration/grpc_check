FROM oven/bun:1 AS base
WORKDIR /usr/src/app


FROM base AS install
RUN mkdir -p /temp/dev
COPY src/front/package.json src/front/bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY src/front/package.json src/front/bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production


FROM base AS prerelease

ARG VITE_GRPC_URL=http://localhost:8080
ENV VITE_GRPC_URL=${VITE_GRPC_URL}

COPY --from=install /temp/dev/node_modules node_modules
COPY src/front/ .
COPY Protos ./Protos

ENV PROTO_ROOT=./Protos
RUN bun run generate:docker

ENV NODE_ENV=production
RUN bun run build


FROM base AS release

COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/dist ./dist
COPY --from=prerelease /usr/src/app/package.json .

USER bun
EXPOSE 4173/tcp
ENTRYPOINT [ "bun", "run", "preview", "--", "--host" ]