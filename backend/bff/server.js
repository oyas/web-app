const { ApolloServer, gql } = require("apollo-server")
const api = require('@opentelemetry/api');
const { promisify } = require('util');
const tracer = require('./tracer')('bff');  // should be executed before @grpc/grpc-js
const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")


const ARTICLES_PROTO_PATH = __dirname + "/../protos/articles/articles.proto"

const API_URL_ARTICLES = process.env.API_URL_ARTICLES || "localhost:50052"
const APP_JAEGER_URL = process.env.APP_JAEGER_URL || "http://localhost:14268"

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  type Article {
    id: ID!
    created: Int!
    userId: String!
    digest: String!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    articles(time: Int): [Article!]!
    time: String
  }

  type Mutation {
    addBook(title: String, author: String): Book
    postArticle(userId: String, digest: String): Article
  }
`

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
const resolvers = {
  Query: {
    books: () => books,
    articles: async (_, { time }) => {
      const span = tracer.startSpan("getArticles")
      return api.context.with(api.trace.setSpan(api.context.active(), span), async () => {
          console.log('Client traceId ', span.spanContext().traceId);
          const articlesGetArticles = promisify(articles_client.GetArticles).bind(
            articles_client
          )
          const result = await articlesGetArticles({ time }).catch(err => {
            console.log(err)
          })
          console.log("[query articles] gRPC result:", result)
          span.end()
          return result.articles
        }
      )
    },
    time: () => Date.now(),
  },
  Mutation: {
    addBook: async (_, { title, author }) => {
      let book = { title, author: author }
      books.push(book)
      console.log("addBook() called: books =", books)
      return book
    },
    postArticle: async (_, { userId, digest }) => {
      const span = tracer.startSpan("postArticle")
      return api.context.with(
        api.trace.setSpan(api.context.active(), span),
        async () => {
          console.log('Client traceId ', span.spanContext().traceId);
          const articlesPost = promisify(articles_client.Post).bind(
            articles_client
          )
          const result = await articlesPost({ userId, digest }).catch(err => {
            console.log(err)
            return { article: {} }
          })
          console.log("gRPC result:", result)
          span.end()
          return result.article
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
const articles_proto = grpc.loadPackageDefinition(
  articles_package_definition
).articles
const articles_client = new articles_proto.Articles(
  API_URL_ARTICLES,
  grpc.credentials.createInsecure()
)

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers })

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
