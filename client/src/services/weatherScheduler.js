import schedule from 'node-schedule';

class WeatherScheduler {
  constructor() {
    this.jobs = new Map();
  }

  // Schedule weather updates every hour
  scheduleWeatherUpdates(callback) {
    const job = schedule.scheduleJob('0 * * * *', callback);
    this.jobs.set('weatherUpdate', job);
    return job;
  }

  // Schedule alert checks every 15 minutes
  scheduleAlertChecks(callback) {
    const job = schedule.scheduleJob('*/15 * * * *', callback);
    this.jobs.set('alertCheck', job);
    return job;
  }

  // Cancel a specific job
  cancelJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.cancel();
      this.jobs.delete(jobName);
    }
  }

  // Cancel all scheduled jobs
  cancelAllJobs() {
    this.jobs.forEach(job => job.cancel());
    this.jobs.clear();
  }
}

export const weatherScheduler = new WeatherScheduler();
export default weatherScheduler; 