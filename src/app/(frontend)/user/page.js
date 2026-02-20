'use server';

import { redirect } from 'next/navigation';

const LoginRestrictPage = () => {
  redirect('/user/login'); // restrict page
};

export default LoginRestrictPage;
