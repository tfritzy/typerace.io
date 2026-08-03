export type AlignmentStep =
  | {
      type: "Match" | "Replace";
      sourceIndex: number;
      targetIndex: number;
    }
  | { type: "Delete"; sourceIndex: number }
  | { type: "Insert"; targetIndex: number };

// Standard Levenshtein alignment, except the target may end at any prefix.
// On equal edit distances, prefer the longest prefix so a substitution wins
// over deleting an otherwise complete final character.
function align(
  source: string,
  target: string,
  requireFullTarget: boolean,
): AlignmentStep[] {
  const distances = Array.from({ length: source.length + 1 }, () =>
    Array<number>(target.length + 1).fill(0),
  );

  for (let sourceIndex = 0; sourceIndex <= source.length; sourceIndex++) {
    distances[sourceIndex][0] = sourceIndex;
  }
  for (let targetIndex = 0; targetIndex <= target.length; targetIndex++) {
    distances[0][targetIndex] = targetIndex;
  }

  for (let sourceIndex = 1; sourceIndex <= source.length; sourceIndex++) {
    for (let targetIndex = 1; targetIndex <= target.length; targetIndex++) {
      const replacementCost =
        source[sourceIndex - 1] === target[targetIndex - 1] ? 0 : 1;
      distances[sourceIndex][targetIndex] = Math.min(
        distances[sourceIndex - 1][targetIndex - 1] + replacementCost,
        distances[sourceIndex - 1][targetIndex] + 1,
        distances[sourceIndex][targetIndex - 1] + 1,
      );
    }
  }

  let closestTargetLength = target.length;
  if (!requireFullTarget) {
    closestTargetLength = 0;
    for (let targetLength = 1; targetLength <= target.length; targetLength++) {
      if (
        distances[source.length][targetLength] <=
        distances[source.length][closestTargetLength]
      ) {
        closestTargetLength = targetLength;
      }
    }
  }

  const reversedSteps: AlignmentStep[] = [];
  let sourceIndex = source.length;
  let targetIndex = closestTargetLength;

  while (sourceIndex > 0 || targetIndex > 0) {
    if (
      sourceIndex > 0 &&
      targetIndex > 0 &&
      source[sourceIndex - 1] === target[targetIndex - 1] &&
      distances[sourceIndex][targetIndex] ===
        distances[sourceIndex - 1][targetIndex - 1]
    ) {
      reversedSteps.push({
        type: "Match",
        sourceIndex: sourceIndex - 1,
        targetIndex: targetIndex - 1,
      });
      sourceIndex--;
      targetIndex--;
      continue;
    }

    if (
      sourceIndex > 0 &&
      targetIndex > 0 &&
      distances[sourceIndex][targetIndex] ===
        distances[sourceIndex - 1][targetIndex - 1] + 1
    ) {
      reversedSteps.push({
        type: "Replace",
        sourceIndex: sourceIndex - 1,
        targetIndex: targetIndex - 1,
      });
      sourceIndex--;
      targetIndex--;
      continue;
    }

    if (
      sourceIndex > 0 &&
      distances[sourceIndex][targetIndex] ===
        distances[sourceIndex - 1][targetIndex] + 1
    ) {
      reversedSteps.push({
        type: "Delete",
        sourceIndex: sourceIndex - 1,
      });
      sourceIndex--;
      continue;
    }

    reversedSteps.push({
      type: "Insert",
      targetIndex: targetIndex - 1,
    });
    targetIndex--;
  }

  return reversedSteps.reverse();
}

export function alignToClosestTargetPrefix(
  source: string,
  target: string,
): AlignmentStep[] {
  return align(source, target, false);
}

export function alignToTarget(
  source: string,
  target: string,
): AlignmentStep[] {
  return align(source, target, true);
}
