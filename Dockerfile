FROM node:18.12.1 as deps
WORKDIR /app
RUN npm install -g bun esno

FROM deps as aimodels
ADD ai-models ai-models

FROM aimodels as setup
ADD logs logs
ADD package.json package.json
ADD bun.lockb bun.lockb
ADD tsconfig.json tsconfig.json

FROM setup as libs
RUN bun install
RUN npm i --platform=linux --arch=x64 sharp

FROM libs as files
ADD src src
ADD prisma prisma
RUN bunx prisma generate

FROM files as release
EXPOSE 3000
ENTRYPOINT [ "esno", "src/index.ts" ]