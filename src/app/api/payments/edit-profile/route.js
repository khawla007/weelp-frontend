// /api/payments/edit-profile

import { NextResponse } from 'next/server';
import { editUserProfileAction } from '@/lib/actions/userActions'; // edit user profile action

export async function POST(req) {
  try {
    const profileData = await req.json(); // ✅ Directly get parsed JSON

    const profileResponse = await editUserProfileAction(profileData);

    if (!profileResponse?.success) {
      const status = profileResponse?.status === 401 ? 401 : profileResponse?.status === 422 ? 422 : 500;
      return NextResponse.json({ success: false, error: profileResponse?.message || 'Profile could not be updated.' }, { status });
    }

    return NextResponse.json({ success: true, data: profileResponse.data });
  } catch {
    return NextResponse.json({ success: false, error: 'Error updating profile' }, { status: 500 });
  }
}
