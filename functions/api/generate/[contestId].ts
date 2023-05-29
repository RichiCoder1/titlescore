import { eq, inArray } from "drizzle-orm";
import { utils, writeXLSX } from "xlsx";
import { getContestMembers } from "~/server/helpers/authz";
import { contestMembers, contestants, contests, scores } from "~/server/schema";

export const onRequest: PagesFunction<CfEnv, string, CfData> = async (
  context
) => {
  const {
    data: { db, authClient },
  } = context;
  const { contestId: id } = context.params;
  const contestId = id as string;

  const contest = await db.query.contests.findFirst({
    where: eq(contests.id, contestId as string),
  });
  const judgeConnections = await getContestMembers(
    authClient,
    contestId,
    "judge"
  );

  const judges = await db.query.contestMembers.findMany({
    where: inArray(
      contestMembers.userId,
      judgeConnections.map(({ userId }) => userId)
    ),
  });

  const criteria = await db.query.criteria.findMany({
    where: eq(scores.contestId, contestId),
  });

  const rawScores = await db.query.scores.findMany({
    where: eq(scores.contestId, contestId),
  });

  const rawContestants = await db.query.contestants.findMany({
    where: eq(contestants.contestId, contestId),
  });

  const workbook = utils.book_new();

  utils.book_append_sheet(workbook, utils.json_to_sheet([]), "Score Reference");
  utils.book_append_sheet(workbook, utils.json_to_sheet(rawScores), "Scores");
  utils.book_append_sheet(workbook, utils.json_to_sheet(judges), "Judges");
  utils.book_append_sheet(
    workbook,
    utils.json_to_sheet(rawContestants),
    "Contestants"
  );
  utils.book_append_sheet(workbook, utils.json_to_sheet(criteria), "Criteria");
  utils.book_append_sheet(
    workbook,
    utils.json_to_sheet([contest]),
    "Contest Detail"
  );

  workbook.Workbook = workbook.Workbook ?? {};
  workbook.Workbook.Names = [
    {
      Name: "ScoreData",
      Ref: `Scores!A2:${utils.encode_col(
        Object.keys(rawScores[0] ?? {}).length
      )}${rawScores.length + 1}`,
    },
  ];
  workbook.Props = {
    Title: contest!.name,
    Author: "Titlescore",
    CreatedDate: new Date(),
  };

  const data = writeXLSX(workbook, {
    type: "array",
    compression: true,
    cellStyles: true,
    WTF: true,
    cellDates: true,
  }) as ArrayBuffer;

  return new Response(data, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `inline; filename=${
        contest?.name ?? "Contest"
      } Data.xlsx`,
    },
  });
};
