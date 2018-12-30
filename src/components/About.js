import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Image from 'gatsby-image'

import { rhythm } from '../utils/typography'

function About() {
  return (
    <div
    style={{
      display: `flex`,
      marginBottom: rhythm(2.5),
    }}
  >
    <p>
      Listicles on software developement where one item must be by the author.  
      Read more and <a href="https://github.com/oneismine/oneismine.github.io/blob/source/README.md">contribute</a>.
    </p>
  </div> 
  )
}

export default About
