import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <body className="bg-gradient-to-r from-[#1b0202] via-[#101452] to-[#520b0b] opacity-90">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
