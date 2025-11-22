import GamePageClient from './GamePageClient';

export async function generateStaticParams(): Promise<Array<{ gameId: string }>> {
  return [{ gameId: '_' }];
}

export default function GamePage(): JSX.Element {
  return <GamePageClient />;
}
