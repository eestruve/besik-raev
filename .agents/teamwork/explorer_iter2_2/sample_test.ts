import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { add } from './sample_util.ts';

describe('Sample Test for relative TS imports', () => {
  it('adds two numbers correctly', () => {
    assert.strictEqual(add(2, 3), 5);
  });
});
