export default async function FamilyMembersPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const familyId = (await params).familyId;

  return (
    <div>
      <h1>Family Members</h1>
      <p>Family ID: {familyId}</p>
    </div>
  );
}
