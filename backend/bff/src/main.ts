import fs from "fs";
import { ApolloServer, gql } from "apollo-server";
import { Resolvers } from "./generated/resolvers";
import api from '@opentelemetry/api';
import { promisify } from 'util';
import setUpTracer from './tracer';
const tracer = setUpTracer('bff');  // should be executed before @grpc/grpc-js
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from "@grpc/proto-loader";
import { ProtoGrpcType } from './generated/articles';


const ARTICLES_PROTO_PATH = __dirname + "/../../protos/articles/articles.proto";
const SCHEMA_GRAPHQL_PATH = __dirname + "/../schema.graphql";

const API_URL_ARTICLES = process.env.API_URL_ARTICLES || "localhost:50052";
const APP_JAEGER_URL = process.env.APP_JAEGER_URL || "http://localhost:14268";

const typeDefs = fs.readFileSync(SCHEMA_GRAPHQL_PATH, { encoding: "utf8" });

const books = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
  },
]

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers: Resolvers = {
  Query: {
    books: () => books,
    articles: async (_, args) => {
      const span = tracer.startSpan("getArticles")
      return api.context.with(api.trace.setSpan(api.context.active(), span), async () => {
          console.log('Client traceId ', span.spanContext().traceId);
          const articlesGetArticles = promisify(articles_client.GetArticles).bind(
            articles_client
          )
          const result = await articlesGetArticles({ time: args.time || 0 }).catch((err: any) => {
            console.log(err)
          })
          console.log("[query articles] gRPC result:", result)
          span.end()
          return result ? result.articles as any : []
        }
      )
    },
    time: () => Date.now().toString(),
  },
  Mutation: {
    addBook: async (_, { title, author }) => {
      let book = { title, author: author }
      // books.push(book)
      console.log("addBook() called: books =", books)
      return book
    },
    postArticle: async (_, args) => {
      let userId = args.userId || ""
      let digest = args.digest || ""
      const span = tracer.startSpan("postArticle")
      return api.context.with(
        api.trace.setSpan(api.context.active(), span),
        async () => {
          console.log('Client traceId ', span.spanContext().traceId);
          const articlesPost = promisify(articles_client.Post).bind(
            articles_client
          )
          const result = await articlesPost({ userId, digest }).catch((err: any) => {
            console.log(err)
            return { article: {} }
          })
          console.log("gRPC result:", result)
          span.end()
          return result ? result.article as any : null
        }
      )
    },
  },
}

// setup gRPC client
const articles_package_definition = protoLoader.loadSync(ARTICLES_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})
const articles_proto = ((grpc.loadPackageDefinition(
  articles_package_definition
) as unknown) as ProtoGrpcType).articles
const articles_client = new articles_proto.Articles(
  API_URL_ARTICLES,
  grpc.credentials.createInsecure()
)

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers })

// The `listen` method launches a web server.
server.listen().then(({ url }: {url: String}) => {
  console.log(`🚀  Server ready at ${url}`)
})
