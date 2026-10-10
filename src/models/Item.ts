import { Schema, model } from 'mongoose';
import type { ItemDoc } from '../types/index';

const itemSchema = new Schema<ItemDoc>({
    // Not a number any more. This holds the _id of a User document, and
    // ref tells Mongoose which collection that id points into.
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    title: {
        type: String,
        required: [true, "title is required!"],
        trim: true,
    },

    description: {
        type: String,
        required: [true, "description is required!"],
        trim: true,
    },

    category: {
        type: String,
        required: [true, "category is required!"],
        trim: true,
    },

    status: {
        type: String,
        required: [true, "status is required!"],
        enum: {
            values: ["lost", "found"],
            message: "status must be either 'lost' or 'found'"
        }
    },

    dateReported: { type: Date, default: Date.now },
});

// FROM SESSION 7: ApiItem, in itelect4-project's src/types/index.ts,
// exists because json-server returned string ids and ISO date strings
// instead of the number and Date that Session 1 declared. MongoDB does
// the same thing. This transform is where that gap gets closed, so the
// frontend keeps reading .id exactly as it has since Session 1.

itemSchema.set("toJSON", {
    transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

export const Item = model<ItemDoc>("Item", itemSchema);