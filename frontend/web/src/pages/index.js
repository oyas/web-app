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
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';


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
    articles(time: 0) {
      id
      digest
    }
    time
  }
`

const POST_ARTICLE = gql`
  mutation postArticle($userId: String!, $digest: String!) {
    postArticle(userId: $userId, digest: $digest) {
      id
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
  const [postArticle] = useMutation(POST_ARTICLE)

  // Make timeline
  const classes = useStyles()
  const timeline = (
    <>
      {runtimeData && runtimeData.articles.map(e => (
        <Card className={classes.root}>
          <CardContent>
            <Typography className={classes.pos} color="textSecondary">
              {e.id}
            </Typography>
            <Typography variant="body2" component="p">
              {e.digest}
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
      <form
        onSubmit={e => {
          e.preventDefault()
          postArticle({ variables: { userId: "user0", digest: input.value } })
            .then((result) => {
              console.log("postArticle:", result)
              refetch()
            })
          input.value = ""
        }}
      >
        <TextField
          inputRef={node => {
            input = node
          }}
          variant="outlined"
          fullWidth
          multiline
        />
        <Button
          className={classes.right}
          variant="contained"
          color="primary"
          type="submit"
          fullWidth
        >
          submit
        </Button>
      </form>

      <Divider />

      {timeline}

      {rawDataView(runtimeData)}
      <Typography>
        {loading && <span>Loading...</span>}
        {error && <span style={{ color: "red" }}>Error: ${error.message}</span>}
        {runtimeData &&
          parseInt(runtimeData.time) &&
          new Date(parseInt(runtimeData.time)).toISOString()}
      </Typography>

    </Layout>
  )
}

export default IndexPage
