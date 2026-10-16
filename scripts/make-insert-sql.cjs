// Generates a dollar-quoted SQL insert for a pipeline run artifact.
const { readFileSync, writeFileSync } = require("fs");
const [, , artifactPath, outPath] = process.argv;
const run = JSON.parse(readFileSync(artifactPath, "utf8"));
const j = (o) => `$asgard$${JSON.stringify(o)}$asgard$::jsonb`;
const esc = (s) => (s == null ? "null" : `'${String(s).replace(/'/g, "''")}'`);
const c = run.extracted.contact;
const sql = `
with upserted as (
  insert into public.asgardians_associates (full_name, email, phone, location, status, credentials)
  values (${esc(c.fullName)}, ${esc(c.email)}, ${esc(c.phone)}, ${esc(c.location)}, 'enhanced',
          ${j({ targetRoles: run.analysis.targetRoles, skills: run.extracted.skills })})
  on conflict do nothing
  returning id
), assoc as (
  select id from upserted
  union all
  select id from public.asgardians_associates where email = ${esc(c.email)}
  limit 1
)
insert into public.asgardians_resumes
  (associate_id, extracted, analysis, enhanced, evaluation, ats_score, iterations, status)
select assoc.id, ${j(run.extracted)}, ${j(run.analysis)}, ${j(run.enhancement)}, ${j(run.evaluation)},
       ${Math.round(run.evaluation.atsScore)}, ${run.iterations}, 'exported'
from assoc
returning id, associate_id;
`;
writeFileSync(outPath, sql);
console.log(`wrote ${outPath} (${sql.length} chars)`);
