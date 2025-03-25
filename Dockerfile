FROM node:22.11.0 AS build
LABEL authors="thekevindit"

#RUN curl -fsSL https://bun.sh/install | bash && \
#    mv /root/.bun/bin/bun /usr/local/bin/bun && \
#    rm -rf /root/.bun

WORKDIR /app

COPY . .

#RUN bun install npx
#RUN bun install
#RUN bun run build

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]