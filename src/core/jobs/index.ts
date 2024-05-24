import { CronJob } from 'cron';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { Prisma } from '@prisma/client';
import { CamelToSnakeCase } from '../casing';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const minutesAgo = (minutes: number) => new Date(new Date().getTime() - minutes * 60000);

const jobFiles = fs.readdirSync(__dirname).filter((file) => file !== 'index.ts');
export type Job = ConstructorParameters<typeof CronJob>['0'] & {
  name: string;
};

export const startJobs = async () => {
  const jobsToStart: Job[] = await Promise.all(jobFiles.map(async (job) => (await import(`./${job}`)).default));
  jobsToStart.forEach((job) => {
    const cronJob = new CronJob(job.cronTime, job.onTick, job.onComplete, job.start, job.timeZone, job.context, job.runOnInit);
    cronJob.start();
  });
  return jobsToStart;
}

export const messageTriggeredJobAggregation = (jobTiming: CamelToSnakeCase<keyof Prisma.JobTimingsCreateInput>, defaultTimeLimitInMinutes: number = 10) => {
  const start = minutesAgo(1440).toISOString();
  return ([
    { '$sort': { 'timestamp': -1 } },
    { '$match': { 'is_response': false } },
    { '$group': { '_id': { 'user_id': '$user_id', 'bot_id': '$bot_id' }, 'ref': { '$first': '$$CURRENT' } } },
    { 
      '$lookup': {
        from: 'bot',
        let: {"searchId": '$ref.bot_id'}, 
        pipeline: [
          { "$addFields": { "strBotId": { "$toString": "$_id" }}},
          { "$match": { "$expr": { "$eq": ["$$searchId", "$strBotId"] }, "disabled": false } },
          {
            "$project": {
              "_id": 1,
              'job_timings': 1,
              'minutes': {
                '$ifNull': [`$job_timings.${jobTiming}`, defaultTimeLimitInMinutes]
              }
            }
          },
        ],
        as: 'job_timings'
      }
    },
    {
      '$project': {
        '_id': 1,
        'ref': 1,
        'minutes': {
          $ifNull: [
            {
              $getField: {
                input: {
                  $first: "$job_timings"
                },
                field: "minutes"
              }
            },
            defaultTimeLimitInMinutes
          ]
        }
      }
    },
    { 
      '$match': {
        $and: [
          {
            $expr: {
              $and: [{
                $gte: [
                  "$ref.timestamp",
                    {
                      $dateFromString: {
                        dateString: start,
                      },
                    },
                  ],
                }, {
                  $lte: [
                    "$ref.timestamp",
                    { 
                      $dateAdd: {
                        startDate: "$$NOW",
                        unit: 'minute',
                        amount: { $multiply: ['$minutes', -1] }
                      }
                    }
                  ],
                },
              ],
            },
          }, {
            [`ref.flags.${jobTiming}`]: { $exists: false }
          }
        ],
      },
    }, 
  ])
}
