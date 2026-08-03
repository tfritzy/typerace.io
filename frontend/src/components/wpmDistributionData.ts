export interface WpmDistributionRecord {
  date: bigint;
  wpm: number;
}

export interface WpmDistributionCohorts {
  newest25: number;
  recent25To50: number;
  oldest50: number;
}

export interface WpmDistributionBucket {
  cohorts: WpmDistributionCohorts;
  count: number;
  label: string;
  maximum: number;
  minimum: number;
}

const BUCKET_SIZE = 5;
const BUCKET_PADDING = 3;

const emptyCohorts = (): WpmDistributionCohorts => ({
  newest25: 0,
  recent25To50: 0,
  oldest50: 0,
});

const getCohortBoundaries = (total: number) => ({
  recent25: Math.ceil(total * 0.25),
  recent50: Math.ceil(total * 0.5),
});

const medianOf = (values: number[]) => {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[midpoint - 1] + sorted[midpoint]) / 2
    : sorted[midpoint];
};

const compareDatesDescending = (
  a: WpmDistributionRecord,
  b: WpmDistributionRecord,
) => {
  if (a.date > b.date) return -1;
  if (a.date < b.date) return 1;
  return 0;
};

export const prepareWpmDistribution = (
  records: readonly WpmDistributionRecord[],
) => {
  const validRecords = records
    .filter((record) => Number.isFinite(record.wpm) && record.wpm >= 0)
    .sort(compareDatesDescending);
  const values = validRecords
    .map((record) => record.wpm)
    .sort((a, b) => a - b);

  if (values.length === 0) {
    return {
      buckets: [],
      best: 0,
      cohortTotals: emptyCohorts(),
      median: 0,
      recentMedian: 0,
      total: 0,
    };
  }

  const minimum = values[0];
  const maximum = values.at(-1)!;
  const median = medianOf(values);
  const cohortBoundaries = getCohortBoundaries(validRecords.length);
  const recentMedian = medianOf(
    validRecords.slice(0, cohortBoundaries.recent25).map((record) => record.wpm),
  );
  const minimumBucketIndex = Math.floor(minimum / BUCKET_SIZE);
  const maximumBucketIndex = Math.floor(maximum / BUCKET_SIZE);
  const firstBucketIndex = Math.max(minimumBucketIndex - BUCKET_PADDING, 0);
  const lastBucketIndex = maximumBucketIndex + BUCKET_PADDING;
  const firstBucket = firstBucketIndex * BUCKET_SIZE;
  const bucketCount = lastBucketIndex - firstBucketIndex + 1;
  const buckets: WpmDistributionBucket[] = Array.from(
    { length: bucketCount },
    (_, index) => {
      const bucketMinimum = firstBucket + index * BUCKET_SIZE;
      const bucketMaximum = bucketMinimum + BUCKET_SIZE;
      return {
        cohorts: emptyCohorts(),
        count: 0,
        label: `${bucketMinimum}–${bucketMaximum}`,
        maximum: bucketMaximum,
        minimum: bucketMinimum,
      };
    },
  );

  validRecords.forEach((record, recordIndex) => {
    const index = Math.min(
      Math.floor((record.wpm - firstBucket) / BUCKET_SIZE),
      buckets.length - 1,
    );
    buckets[index].count += 1;
    if (recordIndex < cohortBoundaries.recent25) {
      buckets[index].cohorts.newest25 += 1;
    } else if (recordIndex < cohortBoundaries.recent50) {
      buckets[index].cohorts.recent25To50 += 1;
    } else {
      buckets[index].cohorts.oldest50 += 1;
    }
  });

  return {
    buckets,
    best: maximum,
    cohortTotals: {
      newest25: cohortBoundaries.recent25,
      recent25To50: cohortBoundaries.recent50 - cohortBoundaries.recent25,
      oldest50: validRecords.length - cohortBoundaries.recent50,
    },
    median,
    recentMedian,
    total: values.length,
  };
};
