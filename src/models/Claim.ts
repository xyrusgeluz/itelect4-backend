import { Schema, model } from "mongoose";
import type { ClaimDoc } from "../types/index";

// The third Session 1 interface, written a second time as a schema --
// the same move User and Item made last week. Claims are the
// resource submitted by users to claim an item.
const claimSchema = new Schema<ClaimDoc>({
    // itemId references the item being claimed
    itemId: {
        type: Schema.Types.ObjectId,
        ref: "Item",
        required: [true, "itemId is required"],
    },

    //claimedBy references the user who submitted the claim
    claimedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "claimedBy is required"],
    },

    submittedAt: {
        type: Date,
        default: Date.now,
    },

    proofUrl: {
        type: String,
        trim: true,
    },
});

// User and Item both rename _id to id here, because the frontend
// has been reading .id off them since Session 1. Claim does the same
// thing: Mongo's own field is _id, so rename it here rather than
// change the frontend.
claimSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Claim = model<ClaimDoc>("Claim", claimSchema);