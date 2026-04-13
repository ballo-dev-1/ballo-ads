import test from "node:test";
import assert from "node:assert/strict";
import {
  compareCompanies,
  compareCompaniesAsc,
  defaultSortDirForKey,
  toComparableTimestamp,
  type SortableCompany,
} from "@/lib/companiesSort";

function base(id: number, overrides: Partial<SortableCompany> = {}): SortableCompany {
  return {
    id,
    industry: "Technology",
    isCompanyVerified: false,
    isActive: true,
    ...overrides,
  };
}

test("defaultSortDirForKey: dates default to desc, text fields to asc", () => {
  assert.equal(defaultSortDirForKey("createdAt"), "desc");
  assert.equal(defaultSortDirForKey("updatedAt"), "desc");
  assert.equal(defaultSortDirForKey("name"), "asc");
  assert.equal(defaultSortDirForKey("verified"), "asc");
});

test("toComparableTimestamp treats missing and invalid as -Infinity", () => {
  assert.equal(toComparableTimestamp(undefined), Number.NEGATIVE_INFINITY);
  assert.equal(toComparableTimestamp(""), Number.NEGATIVE_INFINITY);
  assert.equal(toComparableTimestamp("not-a-date"), Number.NEGATIVE_INFINITY);
});

test("createdAt: asc puts older first, desc reverses", () => {
  const older = base(1, { createdAt: "2020-01-01T00:00:00.000Z" });
  const newer = base(2, { createdAt: "2024-01-01T00:00:00.000Z" });
  assert.ok(compareCompanies(older, newer, "createdAt", "asc") < 0);
  assert.ok(compareCompanies(older, newer, "createdAt", "desc") > 0);
});

test("createdAt: equal timestamps tie-break by id asc; desc flips tie-break", () => {
  const t = "2024-06-01T12:00:00.000Z";
  const low = base(10, { createdAt: t });
  const high = base(20, { createdAt: t });
  assert.ok(compareCompaniesAsc(low, high, "createdAt") < 0);
  assert.ok(compareCompanies(low, high, "createdAt", "desc") > 0);
});

test("name: asc is A-Z, desc is Z-A", () => {
  const a = base(1, { name: "Alpha" });
  const z = base(2, { name: "Zulu" });
  assert.ok(compareCompanies(a, z, "name", "asc") < 0);
  assert.ok(compareCompanies(a, z, "name", "desc") > 0);
});

test("full sort: asc then desc reverses order for same keys", () => {
  const rows: SortableCompany[] = [
    base(3, { name: "Charlie" }),
    base(1, { name: "Alpha" }),
    base(2, { name: "Bravo" }),
  ];
  const asc = [...rows].sort((a, b) => compareCompanies(a, b, "name", "asc")).map((r) => r.id);
  const desc = [...rows].sort((a, b) => compareCompanies(a, b, "name", "desc")).map((r) => r.id);
  assert.deepEqual(asc, [1, 2, 3]);
  assert.deepEqual(desc, [3, 2, 1]);
});

test("lifecycle: when all rows tie on primary field, id tie-break makes asc/desc differ", () => {
  const rows: SortableCompany[] = [base(30, {}), base(10, {}), base(20, {})];
  const asc = [...rows].sort((a, b) => compareCompanies(a, b, "lifecycle", "asc")).map((r) => r.id);
  const desc = [...rows].sort((a, b) => compareCompanies(a, b, "lifecycle", "desc")).map((r) => r.id);
  assert.deepEqual(asc, [10, 20, 30]);
  assert.deepEqual(desc, [30, 20, 10]);
});
