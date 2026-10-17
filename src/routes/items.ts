import { Router, type Request, type Response } from "express";
import { Item } from "../models/Item";
import { requireAuth } from "../middleware/auth";
import type { NewItemBody } from "../types/index";

export const itemRouter = Router();

interface IdParam {
  id: string;
}

// There is no requireAuth line above these two routes, and that is
// the point. items.ts puts one further down so every route below it
// is private; the item list is what the app shows before anybody has
// logged in, so these two are public on purpose.

// GET /api/items -- the full list, newest first
itemRouter.get("/", async (_req: Request, res: Response) => {
  const items = await Item.find().sort({ dateReported: -1 });
  res.json(items);
});

// GET /api/items/:id -- one item by its id
itemRouter.get("/:id", async (req: Request<IdParam>, res: Response) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    res.status(404).json({ message: "No item with that id" });
    return;
  }
  res.json(item);
});

// One line, and every route in this file is behind the token check.
// Anything above this line would be public; everything below needs a
// valid Authorization header.
itemRouter.use(requireAuth);

// POST /api/items
itemRouter.post(
  "/",
  async (
    req: Request<unknown, unknown, NewItemBody>,
    res: Response,
  ) => {
    const item = await Item.create({
      ...req.body,
      // Not req.body.postedBy. The owner comes off the verified
      // token, so a request cannot claim to be someone else by id.
      postedBy: req.userId,
    });

    res.status(201).json(item);
  },
);

// PATCH /api/items/:id
itemRouter.patch(
  "/:id",
  async (
    req: Request<IdParam, unknown, Partial<NewItemBody>>,
    res: Response,
  ) => {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.userId },
      req.body,
      // new: return the row AFTER the change, not before.
      // runValidators: schema rules are skipped on updates otherwise.
      { new: true, runValidators: true },
    );

    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }

    res.json(item);
  },
);

// DELETE /api/items/:id
itemRouter.delete(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      postedBy: req.userId,
    });

    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }

    // 204 means "done, and there is deliberately no body to send".
    res.status(204).send();
  },
);