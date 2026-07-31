export interface WpmDistributionRecord {
  wpm: number;
}

export interface WpmDistributionBucket {
  count: number;
  label: string;
  maximum: number;
  minimum: number;
}

const BUCKET_SIZE = 5;

export const prepareWpmDistribution = (
  records: readonly WpmDistributionRecord[],
) => {
  const values = records
    .map((record) => record.wpm)
    .filter((wpm) => Number.isFinite(wpm) && wpm >= 0)
    .sort((a, b) => a - b);

  if (values.length === 0) {
    return { buckets: [], average: 0, median: 0, total: 0 };
  }

  const minimum = values[0];
  const maximum = values.at(-1)!;
  const midpoint = Math.floor(values.length / 2);
  const median = values.length % 2 === 0
    ? (values[midpoint - 1] + values[midpoint]) / 2
    : values[midpoint];
  const minimumBucketIndex = Math.floor(minimum / BUCKET_SIZE);
  const maximumBucketIndex = Math.floor(maximum / BUCKET_SIZE);
  const medianBucketIndex = Math.floor(median / BUCKET_SIZE);
  const bucketsOnEachSide = Math.max(
    medianBucketIndex - minimumBucketIndex,
    maximumBucketIndex - medianBucketIndex,
  );
  const firstBucket = (medianBucketIndex - bucketsOnEachSide) * BUCKET_SIZE;
  const bucketCount = bucketsOnEachSide * 2 + 1;
  const buckets: WpmDistributionBucket[] = Array.from(
    { length: bucketCount },
    (_, index) => {
      const bucketMinimum = firstBucket + index * BUCKET_SIZE;
      const bucketMaximum = bucketMinimum + BUCKET_SIZE;
      return {
        count: 0,
        label: `${bucketMinimum}–${bucketMaximum}`,
        maximum: bucketMaximum,
        minimum: bucketMinimum,
      };
    },
  );

  for (const wpm of values) {
    const index = Math.min(
      Math.floor((wpm - firstBucket) / BUCKET_SIZE),
      buckets.length - 1,
    );
    buckets[index].count += 1;
  }

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;

  return { buckets, average, median, total: values.length };
};
