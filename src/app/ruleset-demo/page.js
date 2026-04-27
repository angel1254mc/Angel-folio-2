"use client";

import { RulesetSummary } from "../../../summary";

const rowData = (pattern, extra = {}) => ({
   target: "ROW_DATA",
   comparator: "match",
   pattern,
   ...extra,
});

const metadata = (comparator, pattern, extra = {}) => ({
   target: "METADATA",
   comparator,
   pattern,
   ...extra,
});

const columnLocationSchema = schema => ({
   target: "COLUMN_LOCATION",
   schema,
});

const FIXTURES = [
   {
      name: "1. Flat OR of three leaves",
      ruleset: {
         operator: "OR",
         conditions: [
            rowData("foo"),
            rowData("bar"),
            rowData("baz"),
         ],
      },
   },
   {
      name: "2. AND of two ORs (top-down pivot)",
      ruleset: {
         operator: "AND",
         conditions: [
            { operator: "OR", conditions: [rowData("c1"), rowData("c2")] },
            { operator: "OR", conditions: [rowData("c3"), rowData("c4")] },
         ],
      },
   },
   {
      name: "3. Leaves + nested AND subgroup (classifier example)",
      ruleset: {
         operator: "OR",
         conditions: [
            rowData("some-regex"),
            columnLocationSchema("ANGEL_SCHEMA"),
            {
               operator: "AND",
               conditions: [
                  rowData("some-other-regex"),
                  metadata("starts_with", "bombo_clat"),
               ],
            },
         ],
      },
   },
   {
      name: "4. No-op single-child groups collapse (AND > OR > leaf)",
      ruleset: {
         operator: "AND",
         conditions: [
            { operator: "OR", conditions: [rowData("lonely-regex")] },
         ],
      },
   },
   {
      name: "5. Negated single-child group renders as NOT(...)",
      ruleset: {
         operator: "AND",
         conditions: [
            {
               operator: "OR",
               negated: "true",
               conditions: [rowData("blocked-regex")],
            },
         ],
      },
   },
   {
      name: "6. Mixed three-child top level (leaf, leaf, group)",
      ruleset: {
         operator: "OR",
         conditions: [
            rowData("alpha"),
            rowData("beta"),
            {
               operator: "AND",
               conditions: [
                  rowData("gamma"),
                  metadata("equals", "delta"),
               ],
            },
         ],
      },
   },
   {
      name: "7. Deeply nested (AND > [leaf, OR > [leaf, AND > [leaf, leaf]]])",
      ruleset: {
         operator: "AND",
         conditions: [
            rowData("root-leaf"),
            {
               operator: "OR",
               conditions: [
                  rowData("mid-leaf"),
                  {
                     operator: "AND",
                     conditions: [
                        rowData("deep-a"),
                        rowData("deep-b"),
                     ],
                  },
               ],
            },
         ],
      },
   },
   {
      name: "8. Negated group inside a larger rule",
      ruleset: {
         operator: "AND",
         conditions: [
            rowData("required"),
            {
               operator: "OR",
               negated: "true",
               conditions: [
                  rowData("forbidden-a"),
                  rowData("forbidden-b"),
               ],
            },
         ],
      },
   },
];

const wrapStyle = {
   maxWidth: 960,
   margin: "40px auto",
   padding: "0 24px",
   fontFamily: "system-ui, -apple-system, sans-serif",
   color: "#111",
};

const fixtureStyle = {
   display: "grid",
   gridTemplateColumns: "1fr 1fr",
   gap: 24,
   padding: "24px 0",
   borderTop: "1px solid #e5e5e5",
};

const preStyle = {
   background: "#fafafa",
   border: "1px solid #eee",
   borderRadius: 6,
   padding: 12,
   margin: 0,
   fontSize: 12,
   overflowX: "auto",
   whiteSpace: "pre",
};

export default function RulesetDemoPage() {
   return (
      <div style={wrapStyle}>
         <h1 style={{ marginBottom: 4 }}>RulesetSummary — visual tests</h1>
         <p style={{ color: "#555", marginTop: 0 }}>
            Each row shows the ruleset JSON on the left and the rendered{" "}
            <code>&lt;RulesetSummary /&gt;</code> on the right.
         </p>
         {FIXTURES.map((fx, i) => (
            <section key={i} style={fixtureStyle}>
               <div>
                  <h3 style={{ marginTop: 0 }}>{fx.name}</h3>
                  <pre style={preStyle}>
                     <code>{JSON.stringify(fx.ruleset, null, 2)}</code>
                  </pre>
               </div>
               <div>
                  <RulesetSummary ruleset={fx.ruleset} />
               </div>
            </section>
         ))}
      </div>
   );
}
