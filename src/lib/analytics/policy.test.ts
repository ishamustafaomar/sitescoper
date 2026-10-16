import { describe, it, expect } from 'vitest';
import { ownedReportLink } from './policy';
describe('report destinations', () => { it('keeps report identifiers inside the report path', () => { expect(ownedReportLink('../pricing?x=1')).toBe('/analysis/..%2Fpricing%3Fx%3D1'); }); });