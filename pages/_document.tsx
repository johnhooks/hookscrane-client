import Document, { DocumentContext, Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render(): React.ReactElement {
    return (
      <Html lang="en">
        <Head></Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }

  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }
}

export default MyDocument;
