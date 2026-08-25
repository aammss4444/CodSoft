const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const db = require('../db/db'); // assuming this is the DB connection

// Config for ML pipeline
const ML_PIPELINE_URL = process.env.ML_PIPELINE_URL || 'http://localhost:8000';

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const { videoId, athleteId, sportCode, activityCode, llmProvider } = req.body;

  try {
    // Forward the file to the ML pipeline
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path));

    // Append query params if they exist (for manual override, otherwise let ML auto-detect)
    let url = `${ML_PIPELINE_URL}/api/v1/analyze/sport`;
    const queryParams = [];
    if (sportCode) queryParams.push(`sport_code=${sportCode}`);
    if (activityCode) queryParams.push(`activity_code=${activityCode}`);
    if (llmProvider) queryParams.push(`llm_provider=${llmProvider}`);
    if (queryParams.length > 0) url += `?${queryParams.join('&')}`;

    const mlResponse = await axios.post(url, form, {
      headers: {
        ...form.getHeaders()
      }
    });

    const jobId = mlResponse.data.job_id;

    res.json({
      success: true,
      data: {
        analysisId: jobId,
        status: mlResponse.data.status,
        message: 'Analysis started successfully'
      }
    });

    // In a production system, we would use webhooks or polling in a background worker
    // to update the PostgreSQL database. Here we set up a simple polling mechanism 
    // for this prototype to fulfill the requirement of storing the result in the DB.
    pollAndStoreResult(jobId, videoId, athleteId, sportCode, activityCode);

  } catch (error) {
    console.error('Error starting analysis:', error.message);
    res.status(500).json({ success: false, message: 'Failed to start analysis' });
  }
});

router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Check if it's stored in DB
    const dbResult = await db.query('SELECT * FROM video_analyses WHERE id::text = $1 OR error_info = $1', [jobId]);
    if (dbResult.rows.length > 0) {
        return res.json({ success: true, data: dbResult.rows[0] });
    }

    // Fallback to query ML pipeline
    const mlResponse = await axios.get(`${ML_PIPELINE_URL}/api/v1/analyze/video/${jobId}`);
    
    res.json({
      success: true,
      data: mlResponse.data
    });
  } catch (error) {
    console.error('Error fetching analysis:', error.message);
    res.status(404).json({ success: false, message: 'Analysis not found' });
  }
});

async function pollAndStoreResult(jobId, videoId, athleteId, sportCode, activityCode) {
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max
  
  const interval = setInterval(async () => {
    attempts++;
    try {
      const mlResponse = await axios.get(`${ML_PIPELINE_URL}/api/v1/analyze/video/${jobId}`);
      const data = mlResponse.data;
      
      if (data.status === 'completed' || data.status === 'error') {
        clearInterval(interval);
        
        // Ensure we have athlete and video IDs
        const vId = videoId || null;
        const aId = athleteId || null;
        
        if (data.status === 'completed') {
            const results = data.results;
            const detectedSport = sportCode || results.sport;
            const detectedActivity = activityCode || results.activity;
            await db.query(`
              INSERT INTO video_analyses (
                video_id, athlete_id, sport_code, activity_code, analyzer_version, scoring_version,
                analysis_status, performance_index, confidence_score, metrics, component_scores, llm_report
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
              vId, aId, detectedSport, detectedActivity, 'v1', results.scoringVersion,
              'COMPLETED', results.performanceIndex, results.confidenceScore,
              results.metrics, results.componentScores, results.llmReport
            ]);
        } else {
            await db.query(`
              INSERT INTO video_analyses (
                video_id, athlete_id, sport_code, activity_code, analysis_status, error_info
              ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
              vId, aId, sportCode || 'UNKNOWN', activityCode || 'UNKNOWN', 'FAILED', data.message
            ]);
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.error(`Polling timeout for job ${jobId}`);
      }
    } catch (error) {
        // ML pipeline not responding or job not found
        console.error(`Polling error for job ${jobId}: ${error.message}`);
        if (attempts >= maxAttempts) clearInterval(interval);
    }
  }, 5000);
}

module.exports = router;
