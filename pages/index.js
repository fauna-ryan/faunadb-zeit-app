import fetch from 'isomorphic-unfetch';
import Head from 'next/head';

const NOT_DEPLOYED = 'NOT_DEPLOYED';
class NotDeployedError extends Error {
  constructor() {
    super();
    this.code = NOT_DEPLOYED;
    this.message = 'Project must be deployed to ZEIT Now';
  }
}

function App({ collections = [], isDeployed }) {
  const hasCollections = collections.length > 0;

  if (typeof isDeployed === 'undefined') {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: 600, padding: 16 }}>
      <Head>
        <title>FaunaDB ZEIT App</title>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width"
          key="viewport"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <style jsx global>{`
        html,
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
          line-height: 1.7rem;
        }

        code {
          font-family: Menlo, Monaco, 'Lucida Console', 'Liberation Mono',
            'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Courier New',
            monospace, serif;
        }
      `}</style>
      <h1>FaunaDB ZEIT Integration</h1>
      {isDeployed ? (
        <>
          <h2>Collections</h2>
          {hasCollections ? (
            <ul>
              {collections.map(({ name }) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ) : (
            <h5>No Collections</h5>
          )}
        </>
      ) : (
        <>
          <h2>Deploy to ZEIT Now to verify integration</h2>
          <p style={{ fontSize: 20 }}>
            The <code>FAUNADB_SERVER_SECRET</code> environment variable is not
            configured locally or in CodeSandbox, but will be available to the
            application when deployed to ZEIT Now.
          </p>
          <h3>Steps to deploy</h3>
          <ol>
            <li>Fork this CodeSandbox</li>
            <li>
              Deploy to Now using the CodeSandbox ZEIT Now Integration (
              <a
                href="https://codesandbox.io/docs/deployment#zeit"
                rel="noopener noreferrer"
                target="_blank"
              >
                Docs
              </a>
              )
            </li>
          </ol>
        </>
      )}
    </div>
  );
}

App.getInitialProps = async ({ req }) => {
  try {
    const { 'x-now-deployment-url': nowURL } = req.headers;

    if (!nowURL) {
      throw new NotDeployedError();
    }

    const res = await fetch(`https://${nowURL}/api/collections`);
    const { collections, error } = await res.json();

    if (!res.ok) {
      throw new Error(error.message);
    }

    return { collections, isDeployed: true };
  } catch (error) {
    return {
      error: {
        message: error.message
      },
      isDeployed: error.code !== NOT_DEPLOYED
    };
  }
};

export default App;
