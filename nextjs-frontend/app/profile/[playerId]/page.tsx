import ProfilePageClient from './ProfilePageClient';

export async function generateStaticParams(): Promise<Array<{ playerId: string }>> {
  return [{ playerId: '_' }];
}

export default function ProfilePage(): JSX.Element {
  return <ProfilePageClient />;
}
