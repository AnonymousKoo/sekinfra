import test from "node:test";
import assert from "node:assert/strict";
import {PRESSURES,orderedOutcomes,profileFor,profiles} from "../lib/personalization.ts";
test("every closed-vocabulary pressure resolves to a complete profile",()=>{for(const pressure of PRESSURES){const profile=profileFor(pressure);assert.ok(profile);assert.equal(profile.id,pressure);assert.ok(profile.diagnostic.length>=3);assert.ok(profile.flow.length>=4);}});
test("unknown context safely has no profile",()=>{assert.equal(profileFor("unknown"),undefined);assert.equal(profileFor({}),undefined)});
test("outcome ordering is deterministic and keeps catalog access",()=>{const first=orderedOutcomes(profiles.accountability);assert.deepEqual(first,orderedOutcomes(profiles.accountability));assert.deepEqual(first.slice(0,profiles.accountability.outcomes.length),profiles.accountability.outcomes);assert.equal(new Set(first).size,first.length)});
test("profile ids never escape the supported vocabulary",()=>{for(const profile of Object.values(profiles))assert.ok(PRESSURES.includes(profile.id))});
