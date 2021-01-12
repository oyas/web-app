const { ApolloServer, gql } = require("apollo-server")
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

const HELLO_PROTO_PATH = __dirname + '/../protos/helloworld/helloworld.proto';
const ARTICLES_PROTO_PATH = __dirname + '/../protos/articles/articles.proto';

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
      let result = await new Promise((resolve, reject) =>
        articles_client.GetArticles({ time }, (err, response) => {
          if (err) {
            return reject(err)
          }
          resolve(response)
        })
      )
      console.log("[query articles] gRPC result:", result)
      return result.articles
    },
    time: () => Date.now(),
  },
  Mutation: {
    addBook: async (_, { title, author }) => {
      let result = await new Promise((resolve, reject) =>
        hello_client.sayHello({ name: author }, function (err, response) {
          if (err) {
            return reject(err)
          }
          resolve(response)
        })
      )
      console.log("gRPC result:", result)
      let book = { title, author: result.message }
      books.push(book)
      console.log("addBook() called: books =", books)
      return book
    },
    postArticle: async (_, { userId, digest }) => {
      let result = await new Promise((resolve, reject) =>
        articles_client.Post({ userId: userId, digest: digest }, function (err, response) {
          if (err) {
            return reject(err)
          }
          resolve(response)
        })
      )
      console.log("gRPC result:", result)
      return result.article
    },
  },
}

// setup gRPC client
const hello_package_definition = protoLoader.loadSync(HELLO_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})
const hello_proto = grpc.loadPackageDefinition(hello_package_definition).helloworld;
const hello_client = new hello_proto.Greeter(
  process.env.API_URL_GREETER,
  grpc.credentials.createInsecure()
);

const articles_package_definition = protoLoader.loadSync(ARTICLES_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})
const articles_proto = grpc.loadPackageDefinition(articles_package_definition).articles;
const articles_client = new articles_proto.Articles(
  process.env.API_URL_ARTICLES,
  grpc.credentials.createInsecure()
);

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers })

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
