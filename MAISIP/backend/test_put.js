async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/verification/achievements/1/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Approved', comments: 'Looks good' })
    });
    console.log(res.status);
    const text = await res.text();
    console.log(text);
  } catch (e) {
    console.log('Fetch error:', e);
  }
}
test();
