'use server';

import { redirect } from 'next/navigation';

async function LoginRestrictPage() {
  redirect('/user/login'); // restrict page
}

export default LoginRestrictPage;
