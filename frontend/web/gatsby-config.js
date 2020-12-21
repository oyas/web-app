/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
 */

module.exports = {
  /* Your site config here */
  plugins: [
    {
      resolve: `gatsby-source-graphql`,
      options: {
        typeName: `bff`,
        fieldName: `bff`,
        url: `http://bff:4000/graphql`,
        headers: {},
      },
    },
  ],
}
