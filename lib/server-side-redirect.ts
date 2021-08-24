import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

type EmptyProps = Record<string, unknown>;

// https://github.com/vercel/next.js/discussions/11281
// https://github.com/vercel/next.js/discussions/14664
// * https://github.com/vercel/next.js/discussions/14547#discussioncomment-55556
export function serverSideRedirect(
  { res }: GetServerSidePropsContext,
  location: string
): GetServerSidePropsResult<EmptyProps> {
  res.statusCode = 302;
  res.setHeader("Location", location);
  // res.end();
  return { props: {} };
}
