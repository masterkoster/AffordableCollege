import { extractCoursesFromPDF } from './scripts/extract-oakland-courses';

const files = [
  'transfer-guides/OCC-Business.pdf', 
  'transfer-guides/OCC-Biology.pdf', 
  'transfer-guides/Macomb-Engineering.pdf'
];

async function main() {
  for (const f of files) {
    console.log('\n=== Testing:', f, '===');
    const result = await extractCoursesFromPDF(f);
    if (result) {
      console.log('Origin:', result.origin);
      console.log('Major:', result.major, '-', result.majorName);
      console.log('Courses:', result.courses.length);
      console.log('First 5:', result.courses.slice(0,5).map(c => c.code).join(', '));
    } else {
      console.log('Failed to parse');
    }
  }
}

main().catch(console.error);