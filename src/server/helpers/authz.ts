import * as z from "zod";
import { AuthzClient } from "../context";
import { NdJsonStream } from "~/utils/ndjsonstream";

export const NAMESPACE = "titlescore";
export type ContestRelationship = "owner" | "judge" | "organizer";

const Permissionship = z
  .enum([
    "PERMISSIONSHIP_UNSPECIFIED",
    "PERMISSIONSHIP_NO_PERMISSION",
    "PERMISSIONSHIP_HAS_PERMISSION",
  ])
  .transform((val) => {
    switch (val) {
      case "PERMISSIONSHIP_NO_PERMISSION":
        return false;
      case "PERMISSIONSHIP_HAS_PERMISSION":
        return true;
      default:
        return null;
    }
  });

const writtenAtSchema = z.object({
  writtenAt: z.object({
    token: z.string(),
  }),
});

const readAtSchema = z.object({
  readAt: z.object({
    token: z.string(),
  }),
});

const checkPermissionSchema = z.object({
  checkedAt: z.object({
    token: z.string(),
  }),
});

const checkPermissionResponse = checkPermissionSchema.merge(
  z.object({
    permissionship: Permissionship,
  })
);

const errorResponse = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.any()),
  }),
});

const relationshipSchema = z.object({
  resource: z.object({
    objectType: z.string(),
    objectId: z.string(),
  }),
  subject: z.object({
    object: z.object({
      objectType: z.string(),
      objectId: z.string(),
    }),
    optionalRelation: z.string().optional(),
  }),
  relation: z.string(),
  optionalCaveat: z.any().optional(),
});

const readRelationshipResponse = z.union([
  errorResponse,
  z.object({
    result: readAtSchema.merge(
      z.object({
        relationship: relationshipSchema,
      })
    ),
  }),
]);

export type Relationship = {
  userId: string;
  relation: ContestRelationship;
};

export const checkPermission = async (
  client: AuthzClient,
  opts: {
    resourceId: number | string;
    resourceType: string;
    userId: string;
    permission: string;
  }
) => {
  const request = {
    subject: {
      object: {
        objectType: `${NAMESPACE}/user`,
        objectId: opts.userId,
      },
    },
    resource: {
      objectType: `${NAMESPACE}/${opts.resourceType}`,
      objectId: `${opts.resourceId}`,
    },
    permission: opts.permission,
    // TODO: Us Tokens?
    consistency: {
      fullyConsistent: true,
    },
  };

  const response = await client.post("v1/permissions/check", {
    json: request,
  });

  return checkPermissionResponse.parse(await response.json());
};

export const addContestMembers = async (
  client: AuthzClient,
  contestId: number,
  relations: Relationship[]
) => {
  const request = {
    updates: relations.map(({ userId, relation }) => ({
      operation: "OPERATION_CREATE",
      relationship: {
        resource: {
          objectType: `${NAMESPACE}/contest`,
          objectId: `${contestId}`,
        },
        relation,
        subject: {
          object: {
            objectType: `${NAMESPACE}/user`,
            objectId: userId,
          },
        },
      },
    })),
  };

  console.log(JSON.stringify(request))

  const response = await client.post("v1/relationships/write", {
    json: request,
  });
  return writtenAtSchema.parse(await response.json());
};

export const removeContestMembers = async (
  client: AuthzClient,
  contestId: number,
  relations: Relationship[]
) => {
  const request = {
    updates: relations.map(({ userId, relation }) => ({
      operation: "OPERATION_DELETE",
      relationship: {
        resource: {
          objectType: `${NAMESPACE}/contest`,
          objectId: `${contestId}`,
        },
        relation,
        subject: {
          object: {
            objectType: `${NAMESPACE}/user`,
            objectId: userId,
          },
        },
      },
    })),
  };

  const response = await client.post("v1/relationships/write", {
    json: request,
  });
  return writtenAtSchema.parse(await response.json());
};

export const getContestMembers = async (
  client: AuthzClient,
  contestId: number
) => {
  const request = {
    relationshipFilter: {
      resourceType: `${NAMESPACE}/contest`,
      optionalResourceId: `${contestId}`,
      optionalSubjectFilter: {
        subjectType: `${NAMESPACE}/user`,
      },
    },
    consistency: {
      fullyConsistent: true,
    },
  };

  const response = await client.post("v1/relationships/read", {
    json: request,
  });

  const transform = new NdJsonStream();
  const data = response.body!.pipeThrough(transform);

  const relationships: Array<{
    userId: string;
    relation: ContestRelationship;
  }> = [];
  for await (const item of data) {
    const parsed = readRelationshipResponse.parse(item);
    if ("error" in parsed) {
      throw new Error(
        `AuthZed Error [${parsed.error.code}]: ${parsed.error.message}`
      );
    }
    const relationship = parsed.result.relationship;
    relationships.push({
      userId: relationship.subject.object.objectId,
      relation: relationship.relation as ContestRelationship,
    });
  }

  return relationships;
};

export const getContestIdsByUser = async (
  client: AuthzClient,
  userId: string
) => {
  const request = {
    relationshipFilter: {
      resourceType: `${NAMESPACE}/contest`,
      optionalSubjectFilter: {
        subjectType: `${NAMESPACE}/user`,
        optionalSubjectId: userId,
      },
    },
    consistency: {
      fullyConsistent: true,
    },
  };

  const response = await client.post("v1/relationships/read", {
    json: request,
  });

  const transform = new NdJsonStream();
  const data = response.body!.pipeThrough(transform);

  const contests: string[] = [];
  for await (const item of data) {
    const parsed = readRelationshipResponse.parse(item);
    if ("error" in parsed) {
      throw new Error(
        `AuthZed Error [${parsed.error.code}]: ${parsed.error.message}`
      );
    }
    const relationship = parsed.result.relationship;
    contests.push(relationship.resource.objectId);
  }
  return contests.map((id) => parseInt(id, 10));
};

export const getRelation = async (
  client: AuthzClient,
  userId: string,
  contestId: number
) => {
  const request = {
    relationshipFilter: {
      resourceType: `${NAMESPACE}/contest`,
      optionalResourceId: `${contestId}`,
      optionalSubjectFilter: {
        subjectType: `${NAMESPACE}/user`,
        optionalSubjectId: userId,
      },
    },
    consistency: {
      fullyConsistent: true,
    },
  };

  const response = await client.post("v1/relationships/read", {
    json: request,
  });

  const transform = new NdJsonStream();
  const data = response.body!.pipeThrough(transform);

  const relations: string[] = [];
  for await (const item of data) {
    const parsed = readRelationshipResponse.parse(item);
    if ("error" in parsed) {
      throw new Error(
        `AuthZed Error [${parsed.error.code}]: ${parsed.error.message}`
      );
    }
    const relationship = parsed.result.relationship;
    relations.push(relationship.relation);
  }

  return relations[0] as ContestRelationship | undefined;
};
