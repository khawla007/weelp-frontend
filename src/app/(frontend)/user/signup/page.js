import { redirect } from 'next/navigation';

const SignUpPage = () => {
  redirect('/user/login?tab=signup');
};

export default SignUpPage;
