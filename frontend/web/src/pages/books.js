import React, { useState } from "react"
import { graphql, useStaticQuery } from "gatsby"
import { gql, useQuery, useMutation } from "@apollo/client"
import Layout from "../components/layout"
import { TextField, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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

const useStyles = makeStyles({
  root: {
    margin: '4px auto',
    minWidth: 275,
  },
  pos: {
    marginBottom: 12,
  },
});

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

  // Make timeline
  const classes = useStyles()
  const timeline = (
    <>
      {runtimeData && runtimeData.books.map(e => (
        <Card className={classes.root}>
          <CardContent>
            <Typography variant="h5" component="h2">
              {e.title}
            </Typography>
            <Typography className={classes.pos} color="textSecondary">
              {e.author}
            </Typography>
            <Typography variant="body2" component="p">
            </Typography>
          </CardContent>
        </Card>
      ))}
    </>
  )

  // Make raw data viewer
  const rawDataView = data => (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
      >
        <Typography>Raw data</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </AccordionDetails>
    </Accordion>
  )

  let input

  return (
    <Layout>
      <h1>Examples</h1>

      <h2>Build Time</h2>
      {rawDataView(staticData)}
      <Typography>{new Date(parseInt(staticData.time)).toISOString()}</Typography>

      <h2>Runtime</h2>
      {rawDataView(runtimeData)}
      <Typography>
        {loading && <span>Loading...</span>}
        {error && <span style={{ color: "red" }}>Error: ${error.message}</span>}
        {runtimeData &&
          parseInt(runtimeData.time) &&
          new Date(parseInt(runtimeData.time)).toISOString()}
      </Typography>
      {timeline}

      <h2>Mutation</h2>
      <form
        onSubmit={e => {
          e.preventDefault()
          addBook({ variables: { title: "Fox in Socks", author: input.value } })
            .then((result) => {
              console.log("addBook:", result)
              refetch()
            })
          input.value = ""
        }}
      >
        <TextField
          inputRef={node => {
            input = node
          }}
          variant="standard"
        />
        <Button color="primary" type="submit">Add book</Button>
      </form>

    </Layout>
  )
}

export default IndexPage
