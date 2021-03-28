// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { connectDatabase } from "./database";
import { typeDefs, resolvers } from "./graphql";
import cookieParser from "cookie-parser";
import path from "path";

const mount = async (app: Application) => {
  const db = await connectDatabase();

  app.use(cookieParser(process.env.SECRET));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ db, req, res }),
  });
  server.applyMiddleware({ app, path: "/api" });

  if (process.env.NODE_ENV === "production") {
    const staticAssetDir = path.resolve(__dirname, "../../client/build");
    app.use(express.static(staticAssetDir));

    // Express will serve up the index.html if it doens't recognize the route
    app.get("*", (req, res) =>
      res.sendFile(path.resolve(staticAssetDir, "index.html"))
    );
  }

  app.listen(process.env.PORT);

  console.log(`[app]: http://localhost:${process.env.PORT}`);
};

mount(express());
