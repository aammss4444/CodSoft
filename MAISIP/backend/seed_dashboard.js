const db = require('./db/db');

async function run() { 
  try {
    const achievements = [
      { event: '100m Sprint', competition: 'Maharashtra State Athletics Championship 2026', medal: 'Gold Medal', position: '1st Position', date: '25 Jan 2026' },
      { event: '200m Sprint', competition: 'State Athletics Championship 2026', medal: 'Silver Medal', position: '2nd Position', date: '25 Jan 2026' },
      { event: 'Long Jump', competition: 'District Athletics Meet 2025', medal: 'Gold Medal', position: '1st Position', date: '10 Aug 2025' }
    ];
    const pbs = [
      { event: '100m Sprint', value: '10.45', unit: 'sec' },
      { event: '200m Sprint', value: '21.48', unit: 'sec' },
      { event: 'Long Jump', value: '6.85', unit: 'm' },
      { event: 'High Jump', value: '1.75', unit: 'm' }
    ];
    await db.query('UPDATE athlete_achievements SET awards_medals = $1, personal_best_records = $2 WHERE athlete_id = 7', [JSON.stringify(achievements), JSON.stringify(pbs)]);
    console.log('Updated mock data');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
