import test from 'node:test';
import assert from 'node:assert/strict';
import {formatCollectionDate} from '../src/collection-date.js';

test('month and year are readable without inventing a day',()=>{
 assert.equal(formatCollectionDate('2026-10'),'October 2026');
 assert.equal(formatCollectionDate('2024-01'),'January 2024');
 assert.equal(formatCollectionDate(''),'');
});
test('older exact dates still display correctly when supplied',()=>{
 assert.equal(formatCollectionDate('2026-10-08'),'October 8, 2026');
});
