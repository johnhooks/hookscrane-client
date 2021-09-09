// https://kentcdodds.com/blog/stop-mocking-fetch
// this is put into here so I can share these same handlers between my tests
// as well as my development in the browser. Pretty sweet!

import { rest } from "msw"; // msw supports graphql too!

const handlers = [
  rest.post("/refresh", async (req, res, ctx) => {
    // const user = await users.login(JSON.parse(req.body));
    // return res(ctx.json({ user }));
  }),

  rest.post("/login", async (req, res, ctx) => {
    // const user = await users.login(JSON.parse(req.body));
    // const isAuthorized = user.authorize(req.headers.Authorization);
    // if (!isAuthorized) {
    //   return res(ctx.status(401), ctx.json({ message: "Not authorized" }));
    // }
    // const shoppingCart = JSON.parse(req.body);
    // // do whatever other things you need to do with this shopping cart
    // return res(ctx.json({ success: true }));
  }),

  rest.post("/logout", async (req, res, ctx) => {}),
];

export { handlers };
