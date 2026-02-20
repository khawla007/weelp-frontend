export function UserNotFound() {
  return (
    <div className="text-center p-6">
      <h3 className="text-lg font-semibold text-red-500">User not found</h3>
      <p className="text-gray-600">We couldn’t retrieve your profile. Please try again later.</p>
    </div>
  );
}
