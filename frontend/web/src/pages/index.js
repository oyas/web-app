import React, { useState } from "react"
import { graphql, useStaticQuery } from "gatsby"
import { gql, useQuery, useMutation } from "@apollo/client"
import Layout from "../components/layout"

// This query is executed at build time by Gatsby.
const GATSBY_QUERY = graphql`
  query {
    bff {
      books {
        title
        author
      }
      time
    }
  }
`

// This query is executed at run time by Apollo.
const APOLLO_QUERY = gql`
  {
    books {
      title
      author
    }
    time
  }
`

// This is mutation
const ADD_BOOKS = gql`
  mutation addBook($title: String!, $author: String!) {
    addBook(title: $title, author: $author) {
      title
    }
  }
`

const IndexPage = () => {
  // ----------------------
  // BUILD TIME DATA FETCHING USING GRAPHQL
  // ----------------------
  const staticData = useStaticQuery(GATSBY_QUERY).bff

  // ----------------------
  // RUNTIME DATA FETCHING
  // ----------------------
  const { loading, error, data: runtimeData, refetch } = useQuery(APOLLO_QUERY)

  // Mutation
  const [addBook] = useMutation(ADD_BOOKS)

  let input

  return (
    <Layout>
      <h1>Examples</h1>
      <h2>Build Time</h2>
      <p>{JSON.stringify(staticData)}</p>
      <p>{new Date(parseInt(staticData.time)).toISOString()}</p>
      <h2>Runtime</h2>
      <pre>{JSON.stringify(runtimeData, null, 2)}</pre>
      <p>
        {loading && <span>Loading...</span>}
        {error && <span style={{ color: "red" }}>Error: ${error.message}</span>}
        {runtimeData &&
          parseInt(runtimeData.time) &&
          new Date(parseInt(runtimeData.time)).toISOString()}
      </p>
      <h2>Mutation</h2>
      <form
        onSubmit={e => {
          e.preventDefault()
          addBook({ variables: { title: "Fox in Socks", author: input.value } })
          input.value = ""
          refetch()
        }}
      >
        <input
          ref={node => {
            input = node
          }}
          placeholder="Dr. Seuss"
        />
        <button type="submit">Add book</button>
      </form>
    </Layout>
  )
}

export default IndexPage
