// /api/payments/edit-profile

import { publicApi } from '@/lib/axiosInstance';
import { NextResponse } from 'next/server';
import { editUserProfileAction } from '@/lib/actions/userActions'; // edit user profile action

export async function POST(req) {
  try {
    const profileData = await req.json(); // ✅ Directly get parsed JSON

    const profileResponse = await editUserProfileAction(profileData);

    return NextResponse.json({
      success: true,
      data: profileResponse,
    });
  } catch (error) {
    console.error('Edit Profile API Error:', error);

    return NextResponse.json({ success: false, error: 'Error updating profile' }, { status: 500 });
  }
}
