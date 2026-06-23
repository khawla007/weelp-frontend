export function UserNotFound() {
  return (
    <div className="text-center p-6">
      <h3 className="text-lg font-semibold text-destructive">User not found</h3>
      <p className="text-copy">We couldn’t retrieve your profile. Please try again later.</p>
    </div>
  );
}
