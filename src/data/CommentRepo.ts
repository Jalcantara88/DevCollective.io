import { fieldGetterHoc, pickOne } from "./utils";
import DataLoader from "dataloader";
import knexProvider from "./knex-provider";

const commentLoader = new DataLoader<string, DComment>(async (ids) => {
  const knex = await knexProvider();
  return knex<DComment>("comments").whereIn("id", ids);
});

export const getCommentFieldById = fieldGetterHoc((id) => commentLoader.load(id));

export const getCommentIdsForPostId = async (postId: string) => {
  const knex = await knexProvider();
  const comments: DComment[] = await knex("comments").where({
    postId,
  });

  // TODO: Straighten up types
  comments.forEach((c: DComment) => commentLoader.prime("" + c.id, c));

  // TODO: Straighten up types
  return comments.map((c) => "" + c.id);
};

export const getCommentIdsForUserId = async (authorId: string) => {
  const knex = await knexProvider();
  const comments: DComment[] = await knex("comments").where({
    authorId,
  });

  // TODO: Straighten up types
  comments.forEach((c: DComment) => commentLoader.prime("" + c.id, c));

  // TODO: Straighten up types
  return comments.map((c) => "" + c.id);
};

type CreateCommentParams = Pick<DComment, "body" | "postId" | "authorId">;
export const createComment = async (params: CreateCommentParams): Promise<DComment | void> => {
  const knex = await knexProvider();
  const comments: DComment[] = (await knex<DComment>("comments").insert(params).returning("*")) as any;

  // todo: simplify. why do we have to loop over an array??
  if (comments && comments.length) {
    comments.forEach((p) => {
      // TODO: Straighten up types so that "" + is not required
      commentLoader.prime("" + p.id, p);
    });
    return comments[0];
  }
};
