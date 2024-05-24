import Head from 'next/head'
import Waiting from './test2'
export default function Index() {
  return (
    <>
      <Head>
        <title>DegenPot</title>
        <meta name="description" content="DegenPot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

    <Waiting/>
    </>
  )
}
