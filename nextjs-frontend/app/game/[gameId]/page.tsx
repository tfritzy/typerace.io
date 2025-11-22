import GameClient from './GameClient';

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ gameId: string }>> {
  return [];
}

export default function GamePage(): JSX.Element {
  return <GameClient />;
}
