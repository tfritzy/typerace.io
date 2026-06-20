const SCORE_PROOF_MOD = 2_147_483_647;

function addScoreProofText(proof: number, value: string): number {
  let nextProof = proof;
  for (const c of value) {
    nextProof = (nextProof * 31 + c.charCodeAt(0)) % SCORE_PROOF_MOD;
  }
  return nextProof;
}

export function createScoreProof(gameId: string, language: string, score: number): bigint {
  let proof = (score + 73_210_291) % SCORE_PROOF_MOD;
  proof = addScoreProofText(proof, gameId);
  proof = addScoreProofText(proof, language);
  return BigInt((proof * 97 + score * 13 + 1_664_525) % SCORE_PROOF_MOD);
}
