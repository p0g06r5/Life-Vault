import test from 'node:test';
import assert from 'node:assert/strict';
import {parseResumeText,headingOf} from '../src/resume-import.mjs';
test('recognizes common sections without sending resume anywhere',()=>{
 assert.equal(headingOf('PROFESSIONAL EXPERIENCE'),'experience');
 assert.equal(headingOf('Education'),'education');
 assert.equal(headingOf('LICENSES & CERTIFICATIONS'),'certifications');
 const sample=`Alex Example
alex@example.com

PROFESSIONAL SUMMARY
Software engineer with experience building APIs.

EXPERIENCE
Backend Developer | Example Corp
2023 – 2026
Built and maintained APIs.

EDUCATION
Master of Computer Science
Example University
2023

CERTIFICATIONS
Cloud Practitioner
Example Learning
2024

SKILLS
Java, JavaScript, SQL
`;
 const parsed=parseResumeText(sample);
 assert.equal(parsed.data.name,'Alex Example');
 assert.equal(parsed.data.email,'alex@example.com');
 assert.equal(parsed.data.experience[0].title,'Backend Developer');
 assert.equal(parsed.data.education[0].title,'Master of Computer Science');
 assert.equal(parsed.data.certifications[0].title,'Cloud Practitioner');
 assert.ok(parsed.data.skills.includes('Java'));
});
test('does not invent missing sections',()=>{
 const parsed=parseResumeText('Jane Example\nPROFILE\nA short paragraph.\n');
 assert.deepEqual(parsed.data.experience,[]);
 assert.deepEqual(parsed.data.certifications,[]);
});
