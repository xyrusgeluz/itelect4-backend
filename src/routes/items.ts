import { Router, type Request, type Response } from "express";
import { Item } from "../models/Item";
import { requireAuth } from "../middleware/auth";
import type { NewItemBody } from "../types/index";

export const itemRouter = Router();

// One line, and every route in this file is behind the token check.
// Anything above this line would be public; everything below needs a
// valid Authorization header.
itemRouter.use(requireAuth);

interface IdParam {
  id: string;
}

// GET /api/items -- only the ones belonging to this token
itemRouter.get("/", async (req: Request, res: Response) => {
  const items = await Item.find({
    postedBy: req.userId,
  }).sort({ dateReported: -1 }); // -1 means descending (newest first)

  res.json(items);
});

// GET /api/items/:id
itemRouter.get(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    // Both halves matter: the right row, AND the right owner. Without
    // postedBy here, changing the id in the URL reads another row.
    const item = await Item.findOne({
      _id: req.params.id,
      postedBy: req.userId,
    });

    if (!item) {
      res.status(404).json({ message: "No item with that id" });
      return;
    }

    res.json(item);
  },
);

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