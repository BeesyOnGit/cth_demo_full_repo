import { sanitizeAggregation } from "../../../src/features/ai/service";
import { isInScope, stripProtected } from "../../../src/utils/access";
import { rateLimit } from "../../../src/middlewares/rateLimit";

describe("sanitizeAggregation", () => {
    it("rejects non-array pipelines", () => {
        expect(() => sanitizeAggregation("Client", { $match: {} })).toThrow();
    });

    it.each([
        [{ $out: "x" }],
        [{ $merge: { into: "x" } }],
        [{ $match: { $where: "1" } }],
        [{ $unionWith: "employees" }],
        [{ $lookup: { from: "employees", localField: "a", foreignField: "_id", as: "e" } }],
        [{ $facet: { a: [{ $lookup: { from: "invoices", as: "i", pipeline: [{ $graphLookup: { from: "employees" } }] } }] } }],
        [{ $addFields: { x: { $function: { body: "", args: [], lang: "js" } } } }],
    ])("rejects %j", (stage) => {
        expect(() => sanitizeAggregation("Project", [stage])).toThrow();
    });

    it("allows lookups into allowed collections and strips credentials", () => {
        const out = sanitizeAggregation("Employee", [{ $lookup: { from: "drs", localField: "drId", foreignField: "_id", as: "dr" } }]);
        expect(out[0]).toEqual({ $unset: ["passwordHash"] });
        expect(out).toContainEqual({ $unset: ["passwordHash"] });
        expect(out[out.length - 1]).toHaveProperty("$limit");
    });
});

describe("stripProtected / isInScope", () => {
    it("strips protected fields, scope fields only for non-admins", () => {
        const body = { _id: "x", createdBy: "y", passwordHash: "z", isAdmin: true, drId: "d", title: "t" };
        expect(stripProtected(body, false)).toEqual({ title: "t" });
        expect(stripProtected(body, true)).toEqual({ isAdmin: true, drId: "d", title: "t" });
    });

    it("checks antenne first, then DR", () => {
        const doc = { drId: { _id: "d1" }, antenneId: "a1" };
        expect(isInScope(doc, { antenneid: "a1", drid: "other" })).toBe(true);
        expect(isInScope(doc, { antenneid: "a2" })).toBe(false);
        expect(isInScope(doc, { drid: "d2" })).toBe(false);
        expect(isInScope(doc, { isadmin: true, drid: "d2" } as any)).toBe(true);
    });
});

describe("rateLimit", () => {
    it("returns 429 after max hits", () => {
        const mw = rateLimit({ windowMs: 60000, max: 2, key: () => "k" });
        const res: any = { setHeader: jest.fn(), status: jest.fn(() => res), json: jest.fn() };
        const next = jest.fn();
        for (let i = 0; i < 3; i++) mw({} as any, res, next);
        expect(next).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(429);
    });
});

describe("cleanQuery", () => {
    const { cleanQuery } = require("../../../src/middlewares/request");
    const run = (query: any) => {
        const req: any = { query, path: "/projects/" };
        const next = jest.fn();
        cleanQuery(req, {} as any, next);
        return { req, err: next.mock.calls[0][0] };
    };

    it("rejects operator objects", () => {
        expect(run({ isActive: { $ne: "true" } }).err?.status).toBe(400);
        expect(run({ "guarantee.amount": '{"$gt":0}' }).err?.status).toBe(400);
    });

    it("escapes search and normalizes pagination", () => {
        const { req, err } = run({ search: "a.*(", limit: "1000", page: "-3", noPag: "false" });
        expect(err).toBeUndefined();
        expect(req.query.$or[0].name.source).toBe(String.raw`a\.\*\(`);
        expect(req.query).toMatchObject({ limit: 100, page: 1, noPag: false });
    });
});
