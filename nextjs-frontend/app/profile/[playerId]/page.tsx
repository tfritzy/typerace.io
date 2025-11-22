import ProfileClient from './ProfileClient';

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ playerId: string }>> {
  return [];
}

export default function ProfilePage(): JSX.Element {
  return <ProfileClient />;
}
