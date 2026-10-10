import type { Types } from 'mongoose';

export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "admin"; 
  isActive: boolean;
}

export interface Item {
    id: number;
    title: string;
    description: string;
    category: string;
    status: "lost" | "found";
    postedBy: number;
    dateReported: Date;
}

export interface Claim {
    id: number;
    itemId: number;
    claimedBy: number;
    submittedAt: Date;
    proofUrl: string;
}

// UserDoc is the browser's User plus the one field the browser must never see.
// Omit<User, "id"> is every field of User except id.
// The & joins a second object type on, so UserDoc is all of that plus password.
// password exists only here — the frontend's User interface has never had it.
export type UserDoc = Omit<User, "id"> & {
    password: string;
}

// postedBy is an ObjectId, not a number. An ObjectId is an object with its
// own class, not text. Typing it as string compiles fine on its own and then
// fails on every field of the schema at once.
export type ItemDoc = Omit<Item, "id" | "postedBy"> & {
    postedBy: Types.ObjectId;
}

// The body a client sends to create an item. No id, and no postedBy —
// the server reads that off the token instead of trusting the request.
// dateReported is also excluded — the schema defaults it to Date.now.
export type NewItemBody = Pick<Item, "title" | "description" | "category" | "status">;